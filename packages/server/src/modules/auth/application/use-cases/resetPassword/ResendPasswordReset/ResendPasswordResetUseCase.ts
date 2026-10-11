import {
  EmailDeliveryException,
  ResendTooEarlyException,
  ResetCodeNotFoundException,
  TooManyAttemptsException,
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
  normalizeEmail,
  verifyResetRateKey,
  type PasswordResetPendingState,
} from "../utils.js";

export interface ResendPasswordResetRequest {
  email: string;
  lang?: VerificationEmailLang;
}

export type ResendPasswordResetResponse = PasswordResetPendingState;

/**
 * Сценарий: повторная отправка кода сброса пароля.
 */
export class ResendPasswordResetUseCase {
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
   * @throws TooManyAttemptsException
   * @throws ResendTooEarlyException
   * @throws ResetCodeNotFoundException
   * @throws EmailDeliveryException
   */
  async execute(
    request: ResendPasswordResetRequest,
  ): Promise<ResendPasswordResetResponse> {
    const email = normalizeEmail(request.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UserNofFoundException();
    }

    const verifyKey = verifyResetRateKey(user.id);
    const lockCheck = await this.rateLimiter.checkLocked([verifyKey]);
    if (lockCheck.blocked) {
      throw new TooManyAttemptsException(lockCheck.retryAfter);
    }

    const existing = await this.passwordResetRepository.findByUserId(user.id);
    if (existing && Date.parse(existing.resendAvailableAt) > Date.now()) {
      throw new ResendTooEarlyException(existing.resendAvailableAt);
    }

    const code = generateResetCode();
    const codeHash = await this.passwordHasher.hash(code);
    const expiresAt = new Date(Date.now() + this.policy.codeTtlSec * 1000);
    const resendAvailableAt = new Date(
      Date.now() + this.policy.resendCooldownSec * 1000,
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

    const row = existing
      ? await this.passwordResetRepository.refreshForResend({
          userId: user.id,
          codeHash,
          expiresAt,
          resendAvailableAt,
        })
      : await this.passwordResetRepository.upsert({
          userId: user.id,
          codeHash,
          expiresAt,
          resendAvailableAt,
        });

    if (!row) {
      throw new ResetCodeNotFoundException();
    }

    return buildPendingState(email, row, {
      code,
      exposeDevCode: this.policy.exposeDevCode,
    });
  }
}
