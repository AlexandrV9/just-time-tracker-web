export type AuthUserDTO = {
  id: string;
  name: string;
  login: string;
  email?: string | null;
  avatar?: string | null;
};

export type ErrorField = {
  code: string;
  expected: string;
  message: string;
  name: string;
};
