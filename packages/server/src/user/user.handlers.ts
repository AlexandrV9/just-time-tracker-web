import { updateProfileSchema } from "@to-do-list/shared";
import type { Context } from "hono";
import type { AuthVariables } from "../shared/auth/auth.variables.js";
import { getAuthenticatedUserId } from "../shared/auth/with-created-by-id.js";
import { createValidatedHandler } from "../shared/utils/request.js";
import { authRepository } from "../auth/auth.repository.js";
import { userService } from "./user.service.js";

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

export const userHandlers = {
  updateProfile: createValidatedHandler({
    parse: (c) => c.req.json(),
    schema: updateProfileSchema,
    map: (data, c) => ({
      userId: getAuthenticatedUserId(c),
      name: data.name,
      email: data.email,
    }),
    service: userService.updateProfile,
  }),
  getAuthProviders,
};
