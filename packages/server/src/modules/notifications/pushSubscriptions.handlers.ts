import {
  deletePushSubscriptionBodySchema,
  pushSubscriptionBodySchema,
} from "@time-tracker/shared";
import type { Context } from "hono";
import type { AuthVariables } from "../../shared/auth/auth.variables.js";
import { getAuthenticatedUserId } from "../../shared/auth/with-created-by-id.js";
import { createValidatedHandler } from "../../shared/utils/request.js";
import { pushSubscriptionsRepository } from "./pushSubscriptions.repository.js";

const upsertSubscription = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: pushSubscriptionBodySchema,
  map: (data, c) => ({
    userId: getAuthenticatedUserId(c),
    endpoint: data.endpoint,
    p256dh: data.keys.p256dh,
    auth: data.keys.auth,
  }),
  service: async (input) => {
    const subscription = await pushSubscriptionsRepository.createSubscription(
      input,
    );

    return {
      success: true,
      data: subscription,
    };
  },
});

const deleteSubscription = createValidatedHandler({
  parse: (c) => c.req.json(),
  schema: deletePushSubscriptionBodySchema,
  map: (data, c) => ({
    userId: getAuthenticatedUserId(c),
    endpoint: data.endpoint,
  }),
  service: async (input) => {
    const existing = await pushSubscriptionsRepository.findByEndpoint(
      input.endpoint,
    );

    if (!existing || existing.userId !== input.userId) {
      return {
        success: false,
        message: "Subscription not found",
      };
    }

    await pushSubscriptionsRepository.deleteByEndpoint(input.endpoint);

    return {
      success: true,
      data: null,
    };
  },
});

export const pushSubscriptionsHandlers = {
  upsertSubscription: (c: Context<{ Variables: AuthVariables }>) =>
    upsertSubscription(c),
  deleteSubscription: (c: Context<{ Variables: AuthVariables }>) =>
    deleteSubscription(c),
};
