import {
  InvalidTokenException,
  type AuthUserPayload,
  type IJwtAuthTokenManager,
} from "../../../domain/index.js";
import type { IUserRepository } from "../../../../users/domain/index.js";

export interface UpdateRefreshTokenRequest {
  refreshToken: string | undefined;
}

export interface UpdateRefreshTokenResponse {
  accessToken: string;
  user: AuthUserPayload;
}

/**
 * Сценарий: обновление access-токена по refresh-cookie.
 */
export class UpdateRefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthTokenManager: IJwtAuthTokenManager,
  ) {}

  /**
   * @throws InvalidTokenException
   */
  async execute(
    request: UpdateRefreshTokenRequest,
  ): Promise<UpdateRefreshTokenResponse> {
    if (!request.refreshToken) {
      throw new InvalidTokenException();
    }

    const verified = await this.jwtAuthTokenManager.verifyRefreshToken(
      request.refreshToken,
    );

    if (!verified.success) {
      throw new InvalidTokenException();
    }

    const user = await this.userRepository.findById(verified.payload.data.id);
    if (!user) {
      throw new InvalidTokenException();
    }

    const authUser: AuthUserPayload = {
      id: user.id,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      locale: user.locale,
      pushNotificationsEnabled: user.pushNotificationsEnabled,
    };

    const accessToken =
      await this.jwtAuthTokenManager.generateAccessToken(authUser);

    return { accessToken, user: authUser };
  }
}
