import { Hono } from "hono";
import { config, shouldExposeDevCode } from "shared/index.js";
import {
  ConfirmPasswordResetUseCase,
  GetPasswordResetStatusUseCase,
  ResendPasswordResetUseCase,
  RestoreSessionUseCase,
  SignInUseCase,
  SignOutUseCase,
  SignUpUseCase,
  StartPasswordResetUseCase,
  UpdateRefreshTokenUseCase,
  VerifyPasswordResetUseCase,
} from "./application/index.js";
import type { IPasswordResetCodePolicy } from "./domain/index.js";
import {
  AuthRequestRateLimiter,
  ConsoleVerificationCodeMailer,
  PasswordResetTokenCodec,
  SmtpVerificationCodeMailer,
  SqlAuthRateLimits,
  SqlEmailDailyLimitRepository,
  SqlPasswordResetRepository,
  JwtAuthTokenManager,
  VerificationEmailSender,
} from "./infrastructure/index.js";
import { AuthController } from "./presentation/AuthController.js";
import { createAuthMiddleware } from "./presentation/authMiddleware.js";
import { PasswordResetController } from "./presentation/PasswordResetController.js";
import {
  BcryptPasswordHasher,
  SqlUserRepository,
  StrictPasswordPolicyStrategy,
} from "../users/infrastructure/index.js";

export const authRouter = new Hono();

const userRepository = new SqlUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const passwordPolicy = new StrictPasswordPolicyStrategy();
const jwtAuthTokenManager = new JwtAuthTokenManager();
const passwordResetRepository = new SqlPasswordResetRepository();
const emailDailyLimits = new SqlEmailDailyLimitRepository();
const verificationCodeMailer =
  config.email.transport === "smtp"
    ? new SmtpVerificationCodeMailer()
    : new ConsoleVerificationCodeMailer();
const emailSender = new VerificationEmailSender(
  emailDailyLimits,
  verificationCodeMailer,
  config.email.dailyLimitPerUser,
);
const authRateLimits = new SqlAuthRateLimits();
const rateLimiter = new AuthRequestRateLimiter(authRateLimits);
const passwordResetTokenCodec = new PasswordResetTokenCodec();

const passwordResetPolicy: IPasswordResetCodePolicy = {
  codeTtlSec: config.email.verification.codeTtlSec,
  resendCooldownSec: config.email.verification.resendCooldownSec,
  maxStartsPerHourPerEmail:
    config.rateLimit.passwordResetStart.maxPerHourPerEmail,
  maxAttempts: config.email.verification.maxAttempts,
  exposeDevCode: shouldExposeDevCode(),
};

const signUpUseCase = new SignUpUseCase(
  userRepository,
  passwordHasher,
  passwordPolicy,
  jwtAuthTokenManager,
);
const signInUseCase = new SignInUseCase(
  userRepository,
  passwordHasher,
  jwtAuthTokenManager,
  rateLimiter,
  config.rateLimit.login.maxRequestsPerMinutePerIp,
);
const signOutUseCase = new SignOutUseCase();
const updateRefreshTokenUseCase = new UpdateRefreshTokenUseCase(
  userRepository,
  jwtAuthTokenManager,
);
const restoreSessionUseCase = new RestoreSessionUseCase(
  userRepository,
  jwtAuthTokenManager,
);

const getPasswordResetStatusUseCase = new GetPasswordResetStatusUseCase(
  userRepository,
  passwordResetRepository,
);
const startPasswordResetUseCase = new StartPasswordResetUseCase(
  userRepository,
  passwordResetRepository,
  passwordHasher,
  emailSender,
  rateLimiter,
  passwordResetPolicy,
);
const verifyPasswordResetUseCase = new VerifyPasswordResetUseCase(
  userRepository,
  passwordResetRepository,
  passwordHasher,
  rateLimiter,
  passwordResetTokenCodec,
  passwordResetPolicy,
);
const resendPasswordResetUseCase = new ResendPasswordResetUseCase(
  userRepository,
  passwordResetRepository,
  passwordHasher,
  emailSender,
  rateLimiter,
  passwordResetPolicy,
);
const confirmPasswordResetUseCase = new ConfirmPasswordResetUseCase(
  userRepository,
  passwordResetRepository,
  passwordHasher,
  passwordResetTokenCodec,
);

const authController = new AuthController(
  signUpUseCase,
  signInUseCase,
  signOutUseCase,
  updateRefreshTokenUseCase,
  restoreSessionUseCase,
  jwtAuthTokenManager,
);

const passwordResetController = new PasswordResetController(
  getPasswordResetStatusUseCase,
  startPasswordResetUseCase,
  verifyPasswordResetUseCase,
  resendPasswordResetUseCase,
  confirmPasswordResetUseCase,
);

const passwordResetRouter = new Hono();
passwordResetController.register(passwordResetRouter);

authController.register(authRouter);
authRouter.route("/password-reset", passwordResetRouter);

export const authMiddleware = createAuthMiddleware(jwtAuthTokenManager);

export * from "./domain/index.js";
export * from "./infrastructure/index.js";
