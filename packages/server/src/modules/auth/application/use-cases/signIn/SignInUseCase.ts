import {
  InvalidCredentialsException,
  RateLimitedException,
  type AuthUserPayload,
  type IJwtAuthTokenManager,
  type IRequestRateLimiter,
} from "../../../domain/index.js";
import type {
  IPasswordHasher,
  IUserRepository,
} from "../../../../users/domain/index.js";

export interface SignInRequest {
  login: string;
  password: string;
  clientIp: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
}

const loginIpKey = (ip: string) => `login:ip:${ip}`;
const loginAccountKey = (login: string) =>
  `login:account:${login.trim().toLowerCase()}`;

/**
 * Сценарий: вход по логину и паролю (с rate-limit / lockout).
 */
export class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtAuthTokenManager: IJwtAuthTokenManager,
    private readonly rateLimiter: IRequestRateLimiter,
    private readonly maxRequestsPerMinutePerIp: number,
  ) {}

  /**
   * @throws InvalidCredentialsException
   * @throws RateLimitedException
   */
  async execute(request: SignInRequest): Promise<SignInResponse> {
    const lockoutKeys = [
      loginIpKey(request.clientIp),
      loginAccountKey(request.login),
    ];

    const lockCheck = await this.rateLimiter.checkLocked(lockoutKeys);
    if (lockCheck.blocked) {
      throw new RateLimitedException(lockCheck.retryAfter);
    }

    const requestCheck = await this.rateLimiter.check(
      loginIpKey(request.clientIp),
      this.maxRequestsPerMinutePerIp,
      60,
    );
    if (requestCheck.blocked) {
      throw new RateLimitedException(requestCheck.retryAfter);
    }

    await this.rateLimiter.consume(loginIpKey(request.clientIp), 60);

    const user = await this.userRepository.findAuthByLogin(request.login);

    if (!user || !user.passwordHash) {
      const failureResult = await this.rateLimiter.recordFailure(lockoutKeys);
      if (failureResult.blocked) {
        throw new RateLimitedException(failureResult.retryAfter);
      }
      throw new InvalidCredentialsException();
    }

    const isValid = await this.passwordHasher.verify(
      request.password,
      user.passwordHash,
    );

    if (!isValid) {
      const failureResult = await this.rateLimiter.recordFailure(lockoutKeys);
      if (failureResult.blocked) {
        throw new RateLimitedException(failureResult.retryAfter);
      }
      throw new InvalidCredentialsException();
    }

    await this.rateLimiter.recordSuccess(lockoutKeys);

    const authUser: AuthUserPayload = {
      id: user.id,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      locale: user.locale,
      pushNotificationsEnabled: user.pushNotificationsEnabled,
    };

    const tokens = await this.jwtAuthTokenManager.generateTokens(authUser);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: authUser,
    };
  }
}
