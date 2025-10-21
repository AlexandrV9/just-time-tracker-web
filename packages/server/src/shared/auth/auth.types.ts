import type { JWTPayload } from "hono/utils/jwt/types";

export type AuthUser = {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string | null;
  password: string;
};

export type AuthJWTPayload = JWTPayload & {
  data: AuthUser;
};
