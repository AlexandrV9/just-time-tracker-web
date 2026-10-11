import type {
  AuthUserPayload,
  IJwtAuthTokenManager,
} from "../../../domain/index.js";
import type { IUserRepository } from "../../../../users/domain/index.js";

export interface RestoreSessionRequest {
  accessToken: string | null;
  refreshToken: string | undefined;
}

export type RestoreSessionResponse =
  | { status: "ok"; user: AuthUserPayload; accessToken?: string }
  | { status: "unauthorized" };

/**
 * Сценарий: восстановление сессии (access → user, иначе refresh → user + new access).
 */
export class RestoreSessionUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtAuthTokenManager: IJwtAuthTokenManager,
  ) {}

  async execute(
    request: RestoreSessionRequest,
  ): Promise<RestoreSessionResponse> {
    if (request.accessToken) {
      const access = await this.jwtAuthTokenManager.verifyAccessToken(
        request.accessToken,
      );

      if (access.success) {
        const user = await this.userRepository.findById(
          String(access.payload.data.id),
        );
        if (user) {
          return { status: "ok", user: toAuthUser(user) };
        }
        return { status: "unauthorized" };
      }
    }

    if (request.refreshToken) {
      const refresh = await this.jwtAuthTokenManager.verifyRefreshToken(
        request.refreshToken,
      );

      if (refresh.success) {
        const user = await this.userRepository.findById(
          String(refresh.payload.data.id),
        );
        if (!user) {
          return { status: "unauthorized" };
        }

        const authUser = toAuthUser(user);
        const accessToken =
          await this.jwtAuthTokenManager.generateAccessToken(authUser);

        return { status: "ok", user: authUser, accessToken };
      }
    }

    return { status: "unauthorized" };
  }
}

const toAuthUser = (user: {
  id: string;
  login: string;
  name: string;
  avatar: string | null;
  email: string | null;
  locale: AuthUserPayload["locale"];
  pushNotificationsEnabled: boolean;
}): AuthUserPayload => ({
  id: user.id,
  login: user.login,
  name: user.name,
  avatar: user.avatar,
  email: user.email,
  locale: user.locale,
  pushNotificationsEnabled: user.pushNotificationsEnabled,
});
