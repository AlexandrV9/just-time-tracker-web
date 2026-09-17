import type { UserLocaleDTO } from "@time-tracker/shared";

/**
 * Порт выпуска JWT access/refresh токенов.
 */
export interface ITokenIssuer {
  /**
   * Выпускает пару токенов для аутентифицированного пользователя.
   */
  issueTokens(user: {
    id: string;
    login: string;
    name: string;
    avatar: string | null;
    email: string | null;
    locale: UserLocaleDTO;
    pushNotificationsEnabled: boolean;
  }): Promise<{ accessToken: string; refreshToken: string }>;
}
