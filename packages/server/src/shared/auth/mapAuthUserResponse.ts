import type { UserLocaleDTO } from "@time-tracker/shared";

export type AuthUserResponseDTO = {
  id: string;
  login: string;
  name: string;
  avatar: string | null;
  email: string | null;
  locale: UserLocaleDTO;
  pushNotificationsEnabled: boolean;
};

export const mapAuthUserResponse = (user: {
  id: string;
  login: string;
  name: string;
  avatar?: string | null;
  email?: string | null;
  locale?: string | null;
  pushNotificationsEnabled?: boolean | null;
}): AuthUserResponseDTO => ({
  id: String(user.id),
  login: user.login,
  name: user.name,
  avatar: user.avatar ?? null,
  email: user.email ?? null,
  locale: (user.locale ?? "en") as UserLocaleDTO,
  pushNotificationsEnabled: user.pushNotificationsEnabled ?? true,
});
