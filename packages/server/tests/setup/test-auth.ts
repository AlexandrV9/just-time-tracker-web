export const TEST_USER_ID = "user-1";

export const installTestAuthMiddleware = (
  router: { use: Function },
  userId = TEST_USER_ID,
) => {
  router.use("*", async (c: { set: (key: string, value: unknown) => void }, next: () => Promise<void>) => {
    c.set("user", { id: userId });
    await next();
  });
};
