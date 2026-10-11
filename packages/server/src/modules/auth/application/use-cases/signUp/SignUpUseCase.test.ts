import { describe, expect, it, vi } from "vitest";
import type { IJwtAuthTokenManager } from "../../../domain/index.js";
import {
  UserAlreadyExistsException,
  WeakPasswordException,
  type IPasswordHasher,
  type IPasswordPolicyStrategy,
  type IUserRepository,
  type UserDTO,
} from "../../../../users/domain/index.js";
import { SignUpUseCase } from "./SignUpUseCase.js";

const createdUser: UserDTO = {
  id: "user-1",
  login: "alice",
  name: "Alice",
  avatar: null,
  email: null,
  locale: "en",
  pushNotificationsEnabled: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: null,
};

const createUseCase = (overrides?: {
  userRepository?: Partial<IUserRepository>;
  passwordHasher?: Partial<IPasswordHasher>;
  passwordPolicy?: Partial<IPasswordPolicyStrategy>;
  jwtAuthTokenManager?: Partial<IJwtAuthTokenManager>;
}) => {
  const userRepository = {
    findByLogin: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(createdUser),
    ...overrides?.userRepository,
  } as IUserRepository;

  const passwordHasher = {
    hash: vi.fn().mockResolvedValue("hashed"),
    ...overrides?.passwordHasher,
  } as IPasswordHasher;

  const passwordPolicy = {
    validate: vi.fn().mockReturnValue([]),
    ...overrides?.passwordPolicy,
  } as IPasswordPolicyStrategy;

  const jwtAuthTokenManager = {
    generateTokens: vi.fn().mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
    }),
    ...overrides?.jwtAuthTokenManager,
  } as IJwtAuthTokenManager;

  return {
    useCase: new SignUpUseCase(
      userRepository,
      passwordHasher,
      passwordPolicy,
      jwtAuthTokenManager,
    ),
    userRepository,
    passwordHasher,
    passwordPolicy,
    jwtAuthTokenManager,
  };
};

describe("SignUpUseCase", () => {
  it("создаёт пользователя и возвращает токены", async () => {
    const {
      useCase,
      userRepository,
      passwordHasher,
      passwordPolicy,
      jwtAuthTokenManager,
    } = createUseCase();

    const result = await useCase.execute({
      firstName: "Alice",
      login: "alice",
      password: "StrongPass1!",
    });

    expect(passwordPolicy.validate).toHaveBeenCalledWith("StrongPass1!");
    expect(userRepository.findByLogin).toHaveBeenCalledWith("alice");
    expect(passwordHasher.hash).toHaveBeenCalledWith("StrongPass1!");
    expect(userRepository.save).toHaveBeenCalledWith({
      firstName: "Alice",
      login: "alice",
      passwordHash: "hashed",
    });
    expect(jwtAuthTokenManager.generateTokens).toHaveBeenCalledWith({
      id: createdUser.id,
      login: createdUser.login,
      name: createdUser.name,
      avatar: createdUser.avatar,
      email: createdUser.email,
      locale: createdUser.locale,
      pushNotificationsEnabled: createdUser.pushNotificationsEnabled,
    });
    expect(result).toEqual({
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        id: createdUser.id,
        login: createdUser.login,
        name: createdUser.name,
        avatar: createdUser.avatar,
        email: createdUser.email,
        locale: createdUser.locale,
        pushNotificationsEnabled: createdUser.pushNotificationsEnabled,
      },
    });
  });

  it("кидает WeakPasswordException при слабом пароле", async () => {
    const { useCase, userRepository, passwordHasher } = createUseCase({
      passwordPolicy: {
        validate: vi.fn().mockReturnValue(["too short"]),
      },
    });

    await expect(
      useCase.execute({
        firstName: "Alice",
        login: "alice",
        password: "weak",
      }),
    ).rejects.toBeInstanceOf(WeakPasswordException);

    expect(userRepository.findByLogin).not.toHaveBeenCalled();
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it("кидает UserAlreadyExistsException, если login занят", async () => {
    const { useCase, passwordHasher, jwtAuthTokenManager } = createUseCase({
      userRepository: {
        findByLogin: vi.fn().mockResolvedValue(createdUser),
      },
    });

    await expect(
      useCase.execute({
        firstName: "Alice",
        login: "alice",
        password: "StrongPass1!",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsException);

    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(jwtAuthTokenManager.generateTokens).not.toHaveBeenCalled();
  });
});
