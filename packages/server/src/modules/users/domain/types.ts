import type { UserLocaleDTO } from "@time-tracker/shared";

export type UserDTO = {
  id: string;
  login: string;
  name: string;
  avatar: string | null;
  email: string | null;
  locale: UserLocaleDTO;
  pushNotificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type CreateUserDataDTO = {
  firstName: string;
  login: string;
  passwordHash: string;
};

/** Пользователь с credentials для сценариев аутентификации. */
export type UserAuthDTO = UserDTO & {
  passwordHash: string | null;
};

export type UpdateUserDataDTO = {
  id: string;
  login?: string;
  name?: string;
  locale?: UserLocaleDTO;
  pushNotificationsEnabled?: boolean;
};
