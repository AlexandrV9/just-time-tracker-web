import { setPasswordSchema, updateProfileSchema } from "@to-do-list/shared";
import type { Context } from "hono";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { getAuthenticatedUserId } from "../shared/auth/with-created-by-id.js";
import { createValidatedHandler } from "../shared/utils/request.js";
import { authRepository } from "../auth/auth.repository.js";
import { userService } from "./user.service.js";

const SUPPORTED_PROVIDERS = ["yandex"];

const getAuthProviders = async (
  c: Context<{ Variables: AuthVariables }>,
) => {
  const userId = getAuthenticatedUserId(c);
  const providers = await authRepository.findAuthProvidersByUserId(userId);
  return c.json({
    success: true,
    data: providers.map((p) => ({ provider: p.provider, createdAt: p.createdAt })),
  });
};

const unlinkProvider = async (c: Context<{ Variables: AuthVariables }>) => {
  const userId = getAuthenticatedUserId(c);
  const provider = c.req.param("provider");

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    return c.json({ success: false, message: "PROVIDER_NOT_SUPPORTED" }, 400);
  }

  const result = await userService.unlinkProvider({ userId, provider });
  return c.json(result);
};

export const userHandlers = {
  updateProfile: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: updateProfileSchema,
    map: (data, c) => ({
      userId: getAuthenticatedUserId(c),
      name: data.name,
      login: data.login,
    }),
    service: userService.updateProfile,
  }),
  setPassword: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: setPasswordSchema,
    map: (data, c) => ({
      userId: getAuthenticatedUserId(c),
      newPassword: data.newPassword,
    }),
    service: userService.setPassword,
  }),
  getAuthProviders,
  unlinkProvider,
};
