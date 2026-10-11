import {
  InvalidResetCodeException,
  TooManyAttemptsException,
  type IPasswordResetRepository,
  type IPasswordResetTokenCodec,
  type IRequestRateLimiter,
  type IPasswordResetCodePolicy,
} from "../../../../domain/index.js";
import type {
  IPasswordHasher,
  IUserRepository,
} from "../../../../../users/domain/index.js";
import {
  isPasswordResetExpired,
  normalizeEmail,
  verifyResetRateKey,
} from "../utils.js";

export interface VerifyPasswordResetRequest {
  email: string;
  code: string;
}

export type VerifyPasswordResetResponse =
  | { status: "verified"; resetToken: string }
  | { status: "expired" };

/**
 * Сценарий: проверка кода сброса пароля.
 */
export class VerifyPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetRepository: IPasswordResetRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly rateLimiter: IRequestRateLimiter,
    private readonly passwordResetTokenCodec: IPasswordResetTokenCodec,
    private readonly policy: IPasswordResetCodePolicy,
  ) {}

  /**
   * @throws InvalidResetCodeException
   * @throws TooManyAttemptsException
   */
  async execute(
    request: VerifyPasswordResetRequest,
  ): Promise<VerifyPasswordResetResponse> {
    const email = normalizeEmail(request.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidResetCodeException();
    }

    const verifyKey = verifyResetRateKey(user.id);
    const lockCheck = await this.rateLimiter.checkLocked([verifyKey]);
    if (lockCheck.blocked) {
      throw new TooManyAttemptsException(lockCheck.retryAfter);
    }

    const row = await this.passwordResetRepository.findByUserId(user.id);
    if (!row) {
      throw new InvalidResetCodeException();
    }

    if (isPasswordResetExpired(row)) {
      await this.passwordResetRepository.deleteByUserId(user.id);
      return { status: "expired" };
    }

    if (row.attemptsCount >= this.policy.maxAttempts) {
      await this.passwordResetRepository.resetAttempts(user.id);
    }

    const isValid = await this.passwordHasher.verify(
      request.code,
      row.codeHash,
    );

    if (!isValid) {
      await this.passwordResetRepository.incrementAttempts(user.id);
      const failureResult = await this.rateLimiter.recordFailure([verifyKey]);

      if (failureResult.blocked) {
        throw new TooManyAttemptsException(failureResult.retryAfter);
      }

      throw new InvalidResetCodeException();
    }

    await this.rateLimiter.recordSuccess([verifyKey]);

    return {
      status: "verified",
      resetToken: this.passwordResetTokenCodec.encode(user.id),
    };
  }
}
