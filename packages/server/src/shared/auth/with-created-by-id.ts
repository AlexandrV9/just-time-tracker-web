import type { Context } from "hono";
import type { AuthVariables } from "./auth.variables.js";

export type WithCreatedById<T> = T & { createdById: string };

export const getAuthenticatedUserId = (
  c: Context<{ Variables: AuthVariables }>,
) => c.get("user").id;

export const withCreatedById = <T extends object>(
  c: Context<{ Variables: AuthVariables }>,
  data: T,
): WithCreatedById<T> => ({
  ...data,
  createdById: getAuthenticatedUserId(c),
});
