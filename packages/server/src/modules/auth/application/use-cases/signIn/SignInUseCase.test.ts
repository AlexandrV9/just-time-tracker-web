import { describe, expect, it, vi } from "vitest";
import {
  InvalidCredentialsException,
  RateLimitedException,
  type IJwtAuthTokenManager,
  type IRequestRateLimiter,
} from "../../../domain/index.js";
import type {
  IPasswordHasher,
  IUserRepository,
  UserAuthDTO,
} from "../../../../users/domain/index.js";
import { SignInUseCase } from "./SignInUseCase.js";

const authUser: UserAuthDTO = {
  id: "user-1",
  login: "alice",
  name: "Alice",
  avatar: null,
  email: "alice@example.com",
  locale: "en",
  pushNotificationsEnabled: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: null,
  passwordHash: "hash",
};

const allowRateLimiter = (): IRequestRateLimiter =>
  ({
    check: vi.fn().mockResolvedValue({ blocked: false, retryAfter: "" }),
    consume: vi.fn().mockResolvedValue(undefined),
    checkLocked: vi.fn().mockResolvedValue({ blocked: false, retryAfter: "" }),
    recordFailure: vi
      .fn()
      .mockResolvedValue({ blocked: false, retryAfter: "" }),
    recordSuccess: vi.fn().mockResolvedValue(undefined),
  }) as IRequestRateLimiter;

const createUseCase = (overrides?: {
  userRepository?: Partial<IUserRepository>;
  passwordHasher?: Partial<IPasswordHasher>;
  jwtAuthTokenManager?: Partial<IJwtAuthTokenManager>;
  rateLimiter?: IRequestRateLimiter;
}) => {
  const userRepository = {
    findAuthByLogin: vi.fn().mockResolvedValue(authUser),
    ...overrides?.userRepository,
  } as IUserRepository;

  const passwordHasher = {
    verify: vi.fn().mockResolvedValue(true),
    ...overrides?.passwordHasher,
  } as IPasswordHasher;

  const jwtAuthTokenManager = {
    generateTokens: vi.fn().mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    }),
    ...overrides?.jwtAuthTokenManager,
  } as IJwtAuthTokenManager;

  const rateLimiter = overrides?.rateLimiter ?? allowRateLimiter();

  return {
    useCase: new SignInUseCase(
      userRepository,
      passwordHasher,
      jwtAuthTokenManager,
      rateLimiter,
      5,
    ),
    userRepository,
    passwordHasher,
    jwtAuthTokenManager,
    rateLimiter,
  };
};

const creds = { login: "alice", password: "secret", clientIp: "1.2.3.4" };

describe("SignInUseCase", () => {
  it("возвращает токены и user при верных credentials", async () => {
    const { useCase, userRepository, passwordHasher, jwtAuthTokenManager } =
      createUseCase();

    const result = await useCase.execute(creds);

    expect(userRepository.findAuthByLogin).toHaveBeenCalledWith("alice");
    expect(passwordHasher.verify).toHaveBeenCalledWith("secret", "hash");
    expect(jwtAuthTokenManager.generateTokens).toHaveBeenCalledWith({
      id: authUser.id,
      login: authUser.login,
      name: authUser.name,
      avatar: authUser.avatar,
      email: authUser.email,
      locale: authUser.locale,
      pushNotificationsEnabled: authUser.pushNotificationsEnabled,
    });
    expect(result).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        id: authUser.id,
        login: authUser.login,
        name: authUser.name,
        avatar: authUser.avatar,
        email: authUser.email,
        locale: authUser.locale,
        pushNotificationsEnabled: authUser.pushNotificationsEnabled,
      },
    });
  });

  it("кидает InvalidCredentialsException, если пользователь не найден", async () => {
    const { useCase, passwordHasher, jwtAuthTokenManager, rateLimiter } =
      createUseCase({
        userRepository: {
          findAuthByLogin: vi.fn().mockResolvedValue(null),
        },
      });

    await expect(
      useCase.execute({ ...creds, login: "missing" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(passwordHasher.verify).not.toHaveBeenCalled();
    expect(jwtAuthTokenManager.generateTokens).not.toHaveBeenCalled();
    expect(rateLimiter.recordFailure).toHaveBeenCalled();
  });

  it("кидает InvalidCredentialsException, если нет passwordHash", async () => {
    const { useCase, passwordHasher, jwtAuthTokenManager } = createUseCase({
      userRepository: {
        findAuthByLogin: vi.fn().mockResolvedValue({
          ...authUser,
          passwordHash: null,
        }),
      },
    });

    await expect(useCase.execute(creds)).rejects.toBeInstanceOf(
      InvalidCredentialsException,
    );

    expect(passwordHasher.verify).not.toHaveBeenCalled();
    expect(jwtAuthTokenManager.generateTokens).not.toHaveBeenCalled();
  });

  it("кидает InvalidCredentialsException при неверном пароле", async () => {
    const { useCase, jwtAuthTokenManager } = createUseCase({
      passwordHasher: {
        verify: vi.fn().mockResolvedValue(false),
      },
    });

    await expect(
      useCase.execute({ ...creds, password: "wrong" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);

    expect(jwtAuthTokenManager.generateTokens).not.toHaveBeenCalled();
  });

  it("кидает RateLimitedException при активном lockout", async () => {
    const rateLimiter = allowRateLimiter();
    rateLimiter.checkLocked = vi.fn().mockResolvedValue({
      blocked: true,
      retryAfter: "2026-01-01T00:00:00.000Z",
    });

    const { useCase, userRepository } = createUseCase({ rateLimiter });

    await expect(useCase.execute(creds)).rejects.toBeInstanceOf(
      RateLimitedException,
    );
    expect(userRepository.findAuthByLogin).not.toHaveBeenCalled();
  });
});
