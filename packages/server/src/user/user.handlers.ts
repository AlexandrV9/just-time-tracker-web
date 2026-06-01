import { updateProfileSchema } from "@to-do-list/shared";
import { getAuthenticatedUserId } from "../shared/auth/with-created-by-id.js";
import { createValidatedHandler } from "../shared/utils/request.js";
import { userService } from "./user.service.js";

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
};
