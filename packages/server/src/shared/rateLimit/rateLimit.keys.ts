export const rateLimitKeys = {
  loginIp: (ip: string) => `login:ip:${ip}`,
  loginAccount: (login: string) => `login:account:${login.trim().toLowerCase()}`,
  resetEmail: (email: string) => `reset:email:${email.trim().toLowerCase()}`,
  verifyReset: (userId: string) => `verify:reset:${userId}`,
  verifyEmail: (userId: string) => `verify:email:${userId}`,
  emailVerificationStart: (email: string) =>
    `email-verify:start:${email.trim().toLowerCase()}`,
};
