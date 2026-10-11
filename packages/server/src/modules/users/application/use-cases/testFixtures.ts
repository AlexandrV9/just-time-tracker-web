import { vi } from "vitest";
import type { IAuthProviderRepository } from "../../../auth/domain/index.js";
import type {
  IPasswordHasher,
  IPasswordPolicyStrategy,
  IPushSubscriptionCleaner,
  IUserRepository,
  UserDTO,
} from "../../domain/index.js";

export const user: UserDTO = {
  id: "user-1",
  login: "alice",
  name: "Alice",
  avatar: null,
  email: "alice@example.com",
  locale: "en",
  pushNotificationsEnabled: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: null,
};

export const createUserRepository = (
  overrides?: Partial<IUserRepository>,
): IUserRepository =>
  ({
    findById: vi.fn().mockResolvedValue(user),
    findByLogin: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(user),
    getPasswordHash: vi.fn().mockResolvedValue(null),
    setPasswordHash: vi.fn().mockResolvedValue(true),
    update: vi.fn().mockResolvedValue(user),
    ...overrides,
  }) as IUserRepository;

export const createPasswordHasher = (
  overrides?: Partial<IPasswordHasher>,
): IPasswordHasher =>
  ({
    hash: vi.fn().mockResolvedValue("new-hash"),
    verify: vi.fn().mockResolvedValue(true),
    ...overrides,
  }) as IPasswordHasher;

export const createPasswordPolicy = (
  overrides?: Partial<IPasswordPolicyStrategy>,
): IPasswordPolicyStrategy =>
  ({
    validate: vi.fn().mockReturnValue([]),
    ...overrides,
  }) as IPasswordPolicyStrategy;

export const createPushCleaner = (
  overrides?: Partial<IPushSubscriptionCleaner>,
): IPushSubscriptionCleaner =>
  ({
    deleteByUserId: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }) as IPushSubscriptionCleaner;

export const createAuthProviderRepository = (
  overrides?: Partial<IAuthProviderRepository>,
): IAuthProviderRepository =>
  ({
    findByUserId: vi.fn().mockResolvedValue([]),
    disconnect: vi.fn().mockResolvedValue(true),
    ...overrides,
  }) as IAuthProviderRepository;
