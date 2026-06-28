import { config, tokenService } from "../shared/index.js";
import type { ErrorResponse, SuccessResponse } from "../shared/types.js";
import { authRepository } from "./auth.repository.js";
import {
  mapAuthUserResponse,
  type AuthUserResponseDTO,
} from "../shared/auth/mapAuthUserResponse.js";

export type OAuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserResponseDTO;
};

type LoginResult = SuccessResponse<OAuthTokens> | ErrorResponse;
export type YandexProfile = {
  id: string;
  default_email: string | null;
  first_name: string | null;
  login: string;
  default_avatar_id: string | null;
};

type LinkResult = SuccessResponse<{ linked: true }> | ErrorResponse;

export const buildYandexAvatarUrl = (
  avatarId: string | null | undefined,
): string | null => {
  if (!avatarId) return null;
  return `https://avatars.yandex.net/get-yapic/${avatarId}/islands-200`;
};

export const exchangeYandexCode = async (code: string): Promise<string> => {
  const response = await fetch("https://oauth.yandex.ru/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.yandex.clientId,
      client_secret: config.yandex.clientSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Yandex token exchange failed: ${text}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
};

export const fetchYandexProfile = async (
  accessToken: string,
): Promise<YandexProfile> => {
  const response = await fetch("https://login.yandex.ru/info?format=json", {
    headers: { Authorization: `OAuth ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Yandex profile");
  }

  const data = (await response.json()) as {
    id: string;
    default_email?: string;
    first_name?: string;
    login: string;
    default_avatar_id?: string;
  };

  return {
    id: data.id,
    default_email: data.default_email ?? null,
    first_name: data.first_name ?? null,
    login: data.login,
    default_avatar_id: data.default_avatar_id ?? null,
  };
};

const issueTokens = async (user: {
  id: string;
  login: string;
  name: string;
  email: string | null;
  avatar: string | null;
  locale?: string | null;
  pushNotificationsEnabled?: boolean | null;
}): Promise<OAuthTokens> => {
  const [accessToken, refreshToken] = await Promise.all([
    tokenService.generateAccessToken(user),
    tokenService.generateRefreshToken(user),
  ]);
  return {
    accessToken,
    refreshToken,
    user: mapAuthUserResponse(user),
  };
};

export const loginWithYandex = async (
  profile: YandexProfile,
): Promise<LoginResult> => {
  // 1. Known provider → login. A previously disconnected link belongs to the
  //    same account, so re-activate it instead of treating the email as taken.
  const existingProvider = await authRepository.findAuthProvider(
    "yandex",
    profile.id,
  );
  if (existingProvider) {
    const user = await authRepository.getUserById(existingProvider.userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    if (existingProvider.disconnectedAt) {
      await authRepository.reconnectAuthProvider(existingProvider.id);
    }
    return { success: true, data: await issueTokens(user) };
  }

  // 2. Email already taken by another account → error
  if (profile.default_email) {
    const userWithEmail = await authRepository.getUserByEmail(
      profile.default_email,
    );
    if (userWithEmail) {
      return {
        success: false,
        message: "EMAIL_ALREADY_EXISTS",
      };
    }
  }

  // 3. New user → create + link
  const avatar = buildYandexAvatarUrl(profile.default_avatar_id);
  const firstName = profile.first_name || profile.login;
  const login = `yandex_${profile.id}`;

  const newUser = await authRepository.createOAuthUser({
    firstName,
    login,
    email: profile.default_email,
    avatar,
  });

  await authRepository.createAuthProvider({
    userId: newUser.id,
    provider: "yandex",
    providerUserId: profile.id,
  });

  return { success: true, data: await issueTokens(newUser) };
};

export const linkYandexToUser = async (
  userId: string,
  profile: YandexProfile,
): Promise<LinkResult> => {
  // Check if this Yandex account is already linked to any user
  const existingProvider = await authRepository.findAuthProvider(
    "yandex",
    profile.id,
  );
  if (existingProvider) {
    if (existingProvider.userId === userId) {
      if (existingProvider.disconnectedAt) {
        await authRepository.reconnectAuthProvider(existingProvider.id);
        return { success: true, data: { linked: true } };
      }
      return { success: false, message: "PROVIDER_ALREADY_CONNECTED" };
    }

    // Linked to another account, but disconnected → the Yandex account is free.
    // Re-assign the single (provider, provider_user_id) row to the current user.
    if (existingProvider.disconnectedAt) {
      await authRepository.reassignAuthProvider(existingProvider.id, userId);
      return { success: true, data: { linked: true } };
    }

    return { success: false, message: "YANDEX_ALREADY_LINKED" };
  }

  await authRepository.createAuthProvider({
    userId,
    provider: "yandex",
    providerUserId: profile.id,
  });

  return { success: true, data: { linked: true } };
};
