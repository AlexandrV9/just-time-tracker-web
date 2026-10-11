import {
  EmailDeliveryException,
  RateLimitedException,
  UserNofFoundException,
  type IPasswordResetRepository,
  type IRequestRateLimiter,
  type IVerificationEmailSender,
  type IPasswordResetCodePolicy,
  type VerificationEmailLang,
} from "../../../../domain/index.js";
import type {
  IPasswordHasher,
  IUserRepository,
} from "../../../../../users/domain/index.js";
import {
  buildPendingState,
  generateResetCode,
  isPasswordResetExpired,
  normalizeEmail,
  resetEmailRateKey,
  type PasswordResetPendingState,
} from "../utils.js";

export interface StartPasswordResetRequest {
  email: string;
  lang?: VerificationEmailLang;
}

export type StartPasswordResetResponse = PasswordResetPendingState;

/**
 * Сценарий: старт сброса пароля — отправка кода на email.
 */
export class StartPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetRepository: IPasswordResetRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly emailSender: IVerificationEmailSender,
    private readonly rateLimiter: IRequestRateLimiter,
    private readonly policy: IPasswordResetCodePolicy,
  ) {}

  /**
   * @throws UserNofFoundException
   * @throws RateLimitedException
   * @throws EmailDeliveryException
   */
  async execute(
    request: StartPasswordResetRequest,
  ): Promise<StartPasswordResetResponse> {
    const email = normalizeEmail(request.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNofFoundException();
    }

    const existing = await this.passwordResetRepository.findByUserId(user.id);
    if (existing && !isPasswordResetExpired(existing)) {
      return buildPendingState(email, existing);
    }

    const rateLimitCheck = await this.rateLimiter.check(
      resetEmailRateKey(email),
      this.policy.maxStartsPerHourPerEmail,
      3600,
    );

    if (rateLimitCheck.blocked) {
      throw new RateLimitedException(rateLimitCheck.retryAfter);
    }

    const code = generateResetCode();
    const codeHash = await this.passwordHasher.hash(code);

    const now = Date.now();
    const expiresAt = new Date(now + this.policy.codeTtlSec * 1000);
    const resendAvailableAt = new Date(
      now + this.policy.resendCooldownSec * 1000,
    );

    try {
      await this.emailSender.send({
        userId: user.id,
        to: email,
        code,
        lang: request.lang,
      });
    } catch (error) {
      if (error instanceof EmailDeliveryException) {
        throw error;
      }

      throw new EmailDeliveryException(
        error instanceof Error ? error.message : "EMAIL_DELIVERY_FAILED",
      );
    }

    await this.rateLimiter.consume(resetEmailRateKey(email), 3600);

    const row = await this.passwordResetRepository.upsert({
      userId: user.id,
      codeHash,
      expiresAt,
      resendAvailableAt,
    });

    return buildPendingState(email, row, {
      code,
      exposeDevCode: this.policy.exposeDevCode,
    });
  }
}
