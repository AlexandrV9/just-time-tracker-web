import z from "zod";

export const pushSubscriptionKeysSchema = z.object({
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export const pushSubscriptionBodySchema = z.object({
  endpoint: z.url(),
  keys: pushSubscriptionKeysSchema,
});

export type PushSubscriptionBodyDTO = z.infer<typeof pushSubscriptionBodySchema>;

export const deletePushSubscriptionBodySchema = z.object({
  endpoint: z.url(),
});

export type DeletePushSubscriptionBodyDTO = z.infer<
  typeof deletePushSubscriptionBodySchema
>;
