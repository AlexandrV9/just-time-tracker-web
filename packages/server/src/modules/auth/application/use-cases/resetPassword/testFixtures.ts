import { vi } from "vitest";
import type {
  IPasswordResetCodePolicy,
  IPasswordResetRepository,
  IPasswordResetTokenCodec,
  IRequestRateLimiter,
  IVerificationEmailSender,
  PasswordResetRecord,
} from "../../../domain/index.js";
import type {
  IPasswordHasher,
  IUserRepository,
  UserDTO,
} from "../../../../users/domain/index.js";

export const user: UserDTO = {
  id: "user-1",
  login: "alice",
  name: "Alice",
  avatar: null,
  email: "alice@example.com",
  locale: "en",
  pushNotificationsEnabled: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: null,
};

export const futureIso = (msFromNow: number) =>
  new Date(Date.now() + msFromNow).toISOString();

export const pastIso = (msAgo: number) =>
  new Date(Date.now() - msAgo).toISOString();

export const activeResetRow = (
  overrides?: Partial<PasswordResetRecord>,
): PasswordResetRecord => ({
  userId: user.id,
  codeHash: "code-hash",
  attemptsCount: 0,
  expiresAt: futureIso(10 * 60_000),
  resendCount: 0,
  resendAvailableAt: pastIso(1_000),
  ...overrides,
});

export const policy: IPasswordResetCodePolicy = {
  codeTtlSec: 600,
  resendCooldownSec: 60,
  maxStartsPerHourPerEmail: 3,
  maxAttempts: 5,
  exposeDevCode: true,
};

export const allowRateLimiter = (): IRequestRateLimiter =>
  ({
    check: vi.fn().mockResolvedValue({ blocked: false, retryAfter: "" }),
    consume: vi.fn().mockResolvedValue(undefined),
    checkLocked: vi.fn().mockResolvedValue({ blocked: false, retryAfter: "" }),
    recordFailure: vi
      .fn()
      .mockResolvedValue({ blocked: false, retryAfter: "" }),
    recordSuccess: vi.fn().mockResolvedValue(undefined),
  }) as IRequestRateLimiter;

export const createUserRepository = (
  overrides?: Partial<IUserRepository>,
): IUserRepository =>
  ({
    findByEmail: vi.fn().mockResolvedValue(user),
    getPasswordHash: vi.fn().mockResolvedValue("old-hash"),
    setPasswordHash: vi.fn().mockResolvedValue(true),
    ...overrides,
  }) as IUserRepository;

export const createPasswordResetRepository = (
  overrides?: Partial<IPasswordResetRepository>,
): IPasswordResetRepository =>
  ({
    findByUserId: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockImplementation(async (input) =>
      activeResetRow({
        userId: input.userId,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt.toISOString(),
        resendAvailableAt: input.resendAvailableAt.toISOString(),
      }),
    ),
    refreshForResend: vi.fn().mockImplementation(async (input) =>
      activeResetRow({
        userId: input.userId,
        codeHash: input.codeHash,
        expiresAt: input.expiresAt.toISOString(),
        resendAvailableAt: input.resendAvailableAt.toISOString(),
        resendCount: 1,
      }),
    ),
    incrementAttempts: vi.fn().mockResolvedValue(1),
    resetAttempts: vi.fn().mockResolvedValue(true),
    deleteByUserId: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as IPasswordResetRepository;

export const createPasswordHasher = (
  overrides?: Partial<IPasswordHasher>,
): IPasswordHasher =>
  ({
    hash: vi.fn().mockResolvedValue("hashed"),
    verify: vi.fn().mockResolvedValue(true),
    ...overrides,
  }) as IPasswordHasher;

export const createEmailSender = (
  overrides?: Partial<IVerificationEmailSender>,
): IVerificationEmailSender =>
  ({
    send: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as IVerificationEmailSender;

export const createTokenCodec = (
  overrides?: Partial<IPasswordResetTokenCodec>,
): IPasswordResetTokenCodec =>
  ({
    encode: vi.fn().mockReturnValue("reset-token"),
    decode: vi.fn().mockReturnValue({ userId: user.id }),
    ...overrides,
  }) as IPasswordResetTokenCodec;
