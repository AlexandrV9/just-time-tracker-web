import { describe, expect, it, vi } from "vitest";
import {
  UserAlreadyExistsException,
  UserNotFoundException,
} from "../../../domain/index.js";
import { createUserRepository, user } from "../testFixtures.js";
import { UpdateUserUseCase } from "./UpdateUserUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
}) => {
  const userRepository =
    overrides?.userRepository ??
    createUserRepository({
      update: vi.fn().mockResolvedValue({
        ...user,
        name: "Alice Updated",
        login: "alice2",
      }),
    });

  return {
    useCase: new UpdateUserUseCase(userRepository),
    userRepository,
  };
};

describe("UpdateUserUseCase", () => {
  it("обновляет имя и логин", async () => {
    const { useCase, userRepository } = createUseCase();

    const result = await useCase.execute({
      userId: user.id,
      name: "Alice Updated",
      login: "alice2",
    });

    expect(userRepository.findByLogin).toHaveBeenCalledWith("alice2");
    expect(userRepository.update).toHaveBeenCalledWith({
      id: user.id,
      name: "Alice Updated",
      login: "alice2",
    });
    expect(result).toEqual({
      id: user.id,
      name: "Alice Updated",
      login: "alice2",
      email: user.email,
      avatar: user.avatar,
      locale: user.locale,
      pushNotificationsEnabled: user.pushNotificationsEnabled,
    });
  });

  it("разрешает тот же login текущего пользователя", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        findByLogin: vi.fn().mockResolvedValue(user),
        update: vi.fn().mockResolvedValue(user),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        name: "Alice",
        login: "alice",
      }),
    ).resolves.toMatchObject({ id: user.id, login: "alice" });
  });

  it("кидает UserAlreadyExistsException, если login занят другим", async () => {
    const { useCase, userRepository } = createUseCase({
      userRepository: createUserRepository({
        findByLogin: vi.fn().mockResolvedValue({
          ...user,
          id: "other-user",
        }),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        name: "Alice",
        login: "taken",
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsException);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it("кидает UserNotFoundException, если update вернул null", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        update: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        name: "Alice",
        login: "alice",
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
