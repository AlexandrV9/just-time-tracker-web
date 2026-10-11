import { config, pool, tokenService } from "../../../shared/index.js";
import type { ErrorResponse, SuccessResponse } from "../../../shared/types.js";
import {
  mapAuthUserResponse,
  type AuthUserResponseDTO,
} from "../../../shared/auth/mapAuthUserResponse.js";

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

type AuthProviderRow = {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
  disconnectedAt: string | null;
};

type OAuthUserRow = {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string | null;
  locale?: string | null;
  pushNotificationsEnabled?: boolean | null;
};

// Temporary data access until Yandex OAuth is migrated to modules/auth.
const findAuthProvider = async (
  provider: string,
  providerUserId: string,
): Promise<AuthProviderRow | null> => {
  const { rows } = await pool.query(
    `
      SELECT
        id,
        user_id AS "userId",
        provider,
        provider_user_id AS "providerUserId",
        disconnected_at AS "disconnectedAt"
      FROM auth_providers
      WHERE provider = $1 AND provider_user_id = $2
    `,
    [provider, providerUserId],
  );
  return (rows[0] as AuthProviderRow | undefined) ?? null;
};

const getUserById = async (userId: string): Promise<OAuthUserRow | null> => {
  const { rows } = await pool.query(
    `
      SELECT
        id,
        login,
        first_name AS name,
        email,
        avatar,
        locale,
        push_notifications_enabled AS "pushNotificationsEnabled"
      FROM users
      WHERE id = $1
    `,
    [userId],
  );
  return (rows[0] as OAuthUserRow | undefined) ?? null;
};

const getUserByEmail = async (email: string): Promise<OAuthUserRow | null> => {
  const { rows } = await pool.query(
    `
      SELECT
        id,
        login,
        first_name AS name,
        email,
        avatar,
        locale,
        push_notifications_enabled AS "pushNotificationsEnabled"
      FROM users
      WHERE email = $1
    `,
    [email],
  );
  return (rows[0] as OAuthUserRow | undefined) ?? null;
};

const createOAuthUser = async (data: {
  firstName: string;
  login: string;
  email: string | null;
  avatar: string | null;
}): Promise<OAuthUserRow> => {
  const emailVerifiedAt = data.email ? new Date().toISOString() : null;
  const { rows } = await pool.query(
    `
      INSERT INTO users (first_name, login, email, avatar, email_verified_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name AS name, login, email, avatar
    `,
    [data.firstName, data.login, data.email, data.avatar, emailVerifiedAt],
  );
  return rows[0] as OAuthUserRow;
};

const createAuthProvider = async (data: {
  userId: string;
  provider: string;
  providerUserId: string;
}): Promise<void> => {
  await pool.query(
    `
      INSERT INTO auth_providers (user_id, provider, provider_user_id)
      VALUES ($1, $2, $3)
    `,
    [data.userId, data.provider, data.providerUserId],
  );
};

const reconnectAuthProvider = async (id: string): Promise<void> => {
  await pool.query(
    `
      UPDATE auth_providers
      SET disconnected_at = NULL
      WHERE id = $1
    `,
    [id],
  );
};

const reassignAuthProvider = async (
  id: string,
  userId: string,
): Promise<void> => {
  await pool.query(
    `
      UPDATE auth_providers
      SET user_id = $2, disconnected_at = NULL
      WHERE id = $1
    `,
    [id, userId],
  );
};

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

const issueTokens = async (user: OAuthUserRow): Promise<OAuthTokens> => {
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
  const existingProvider = await findAuthProvider("yandex", profile.id);
  if (existingProvider) {
    const user = await getUserById(existingProvider.userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    if (existingProvider.disconnectedAt) {
      await reconnectAuthProvider(existingProvider.id);
    }
    return { success: true, data: await issueTokens(user) };
  }

  // 2. Email already taken by another account → error
  if (profile.default_email) {
    const userWithEmail = await getUserByEmail(profile.default_email);
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

  const newUser = await createOAuthUser({
    firstName,
    login,
    email: profile.default_email,
    avatar,
  });

  await createAuthProvider({
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
  const existingProvider = await findAuthProvider("yandex", profile.id);
  if (existingProvider) {
    if (existingProvider.userId === userId) {
      if (existingProvider.disconnectedAt) {
        await reconnectAuthProvider(existingProvider.id);
        return { success: true, data: { linked: true } };
      }
      return { success: false, message: "PROVIDER_ALREADY_CONNECTED" };
    }

    // Linked to another account, but disconnected → the Yandex account is free.
    // Re-assign the single (provider, provider_user_id) row to the current user.
    if (existingProvider.disconnectedAt) {
      await reassignAuthProvider(existingProvider.id, userId);
      return { success: true, data: { linked: true } };
    }

    return { success: false, message: "YANDEX_ALREADY_LINKED" };
  }

  await createAuthProvider({
    userId,
    provider: "yandex",
    providerUserId: profile.id,
  });

  return { success: true, data: { linked: true } };
};
