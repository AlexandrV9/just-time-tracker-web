import type { UserLocaleDTO } from "@time-tracker/shared";
import type { AuthJWTPayload } from "shared/auth/auth.types.js";

export type AuthUserPayload = {
  /**
   * Идентификатор пользователя
   */
  id: string;
  /**
   * Логин пользователя
   */
  login: string;
  /**
   * Имя пользователя
   */
  name: string;
  /**
   * Аватар пользователя
   */
  avatar: string | null;
  /**
   * Почта пользователя
   */
  email: string | null;
  /**
   * Локаль пользователя
   */
  locale: UserLocaleDTO;
  /**
   * Разрешено ли использовать push-уведомления
   */
  pushNotificationsEnabled: boolean;
};

export type GenerateTokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export type VerifyAccessTokenResponse =
  | {
      success: true;
      payload: AuthJWTPayload;
    }
  | {
      success: false;
      payload: null;
    };

export type VerifyRefreshTokenResponse =
  | {
      success: true;
      payload: AuthJWTPayload;
    }
  | {
      success: false;
      payload: null;
    };

type PlainObject = Record<string, unknown>;

/**
 * Порт выпуска и проверки JWT токенов.
 */
export interface IJwtAuthTokenManager {
  /**
   * Генерирует accessToken
   */
  generateAccessToken<TData extends PlainObject>(
    payload: TData,
  ): Promise<string>;
  /**
   * Генерирует refreshToken
   */
  generateRefreshToken<TData extends PlainObject>(
    payload: TData,
  ): Promise<string>;
  /**
   * Генерирует accessToken + refreshToken
   */
  generateTokens(user: AuthUserPayload): Promise<GenerateTokensResponse>;
  /**
   * Проверить accessToken на валидность
   */
  verifyAccessToken(accessToken: string): Promise<VerifyAccessTokenResponse>;
  /**
   * Проверить refreshToken на валидность
   */
  verifyRefreshToken(refreshToken: string): Promise<VerifyRefreshTokenResponse>;
  /**
   * Извлечь token из заголовка запроса 
   */
  extractTokenFromAuthHeader(authHeader: string): string | null;
}
