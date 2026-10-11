import { describe, expect, it, vi } from "vitest";
import {
  InvalidTokenException,
  type IJwtAuthTokenManager,
} from "../../../domain/index.js";
import type {
  IUserRepository,
  UserDTO,
} from "../../../../users/domain/index.js";
import { UpdateRefreshTokenUseCase } from "./UpdateRefreshTokenUseCase.js";

const user: UserDTO = {
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

const createUseCase = (overrides?: {
  userRepository?: Partial<IUserRepository>;
  jwtAuthTokenManager?: Partial<IJwtAuthTokenManager>;
}) => {
  const userRepository = {
    findById: vi.fn().mockResolvedValue(user),
    ...overrides?.userRepository,
  } as IUserRepository;

  const jwtAuthTokenManager = {
    verifyRefreshToken: vi.fn().mockResolvedValue({
      success: true,
      payload: { data: { id: user.id } },
    }),
    generateAccessToken: vi.fn().mockResolvedValue("new-access"),
    ...overrides?.jwtAuthTokenManager,
  } as IJwtAuthTokenManager;

  return {
    useCase: new UpdateRefreshTokenUseCase(
      userRepository,
      jwtAuthTokenManager,
    ),
    userRepository,
    jwtAuthTokenManager,
  };
};

describe("UpdateRefreshTokenUseCase", () => {
  it("возвращает новый accessToken и user по валидному refresh", async () => {
    const { useCase, userRepository, jwtAuthTokenManager } = createUseCase();

    const result = await useCase.execute({ refreshToken: "refresh" });

    expect(jwtAuthTokenManager.verifyRefreshToken).toHaveBeenCalledWith(
      "refresh",
    );
    expect(userRepository.findById).toHaveBeenCalledWith(user.id);
    expect(jwtAuthTokenManager.generateAccessToken).toHaveBeenCalledWith({
      id: user.id,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      locale: user.locale,
      pushNotificationsEnabled: user.pushNotificationsEnabled,
    });
    expect(result).toEqual({
      accessToken: "new-access",
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        locale: user.locale,
        pushNotificationsEnabled: user.pushNotificationsEnabled,
      },
    });
  });

  it("кидает InvalidTokenException, если refreshToken отсутствует", async () => {
    const { useCase, jwtAuthTokenManager } = createUseCase();

    await expect(
      useCase.execute({ refreshToken: undefined }),
    ).rejects.toBeInstanceOf(InvalidTokenException);
    expect(jwtAuthTokenManager.verifyRefreshToken).not.toHaveBeenCalled();
  });

  it("кидает InvalidTokenException при невалидном refresh", async () => {
    const { useCase, userRepository } = createUseCase({
      jwtAuthTokenManager: {
        verifyRefreshToken: vi.fn().mockResolvedValue({
          success: false,
          payload: null,
        }),
      },
    });

    await expect(
      useCase.execute({ refreshToken: "bad" }),
    ).rejects.toBeInstanceOf(InvalidTokenException);
    expect(userRepository.findById).not.toHaveBeenCalled();
  });

  it("кидает InvalidTokenException, если пользователь не найден", async () => {
    const { useCase, jwtAuthTokenManager } = createUseCase({
      userRepository: {
        findById: vi.fn().mockResolvedValue(null),
      },
    });

    await expect(
      useCase.execute({ refreshToken: "refresh" }),
    ).rejects.toBeInstanceOf(InvalidTokenException);
    expect(jwtAuthTokenManager.generateAccessToken).not.toHaveBeenCalled();
  });
});
