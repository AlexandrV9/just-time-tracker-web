import { describe, expect, it, vi } from "vitest";
import {
  InvalidCurrentPasswordException,
  PasswordNotSetException,
  SamePasswordException,
  UserNotFoundException,
  WeakPasswordException,
} from "../../../domain/index.js";
import {
  createPasswordHasher,
  createPasswordPolicy,
  createUserRepository,
  user,
} from "../testFixtures.js";
import { UpdatePasswordUseCase } from "./UpdatePasswordUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
  passwordHasher?: ReturnType<typeof createPasswordHasher>;
  passwordPolicy?: ReturnType<typeof createPasswordPolicy>;
}) => {
  const userRepository =
    overrides?.userRepository ??
    createUserRepository({
      getPasswordHash: vi.fn().mockResolvedValue("old-hash"),
    });
  const passwordHasher =
    overrides?.passwordHasher ??
    createPasswordHasher({
      verify: vi
        .fn()
        .mockImplementation(
          async (password: string) => password === "OldPass1!",
        ),
    });
  const passwordPolicy = overrides?.passwordPolicy ?? createPasswordPolicy();

  return {
    useCase: new UpdatePasswordUseCase(
      userRepository,
      passwordHasher,
      passwordPolicy,
    ),
    userRepository,
    passwordHasher,
    passwordPolicy,
  };
};

describe("UpdatePasswordUseCase", () => {
  it("меняет пароль при верном current", async () => {
    const { useCase, userRepository, passwordHasher } = createUseCase();

    await expect(
      useCase.execute({
        userId: user.id,
        currentPassword: "OldPass1!",
        newPassword: "NewPass1!",
      }),
    ).resolves.toBeUndefined();

    expect(passwordHasher.hash).toHaveBeenCalledWith("NewPass1!");
    expect(userRepository.setPasswordHash).toHaveBeenCalledWith(
      user.id,
      "new-hash",
    );
  });

  it("кидает WeakPasswordException при слабом новом пароле", async () => {
    const { useCase, userRepository } = createUseCase({
      passwordPolicy: createPasswordPolicy({
        validate: vi.fn().mockReturnValue(["too short"]),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        currentPassword: "OldPass1!",
        newPassword: "weak",
      }),
    ).rejects.toBeInstanceOf(WeakPasswordException);
    expect(userRepository.getPasswordHash).not.toHaveBeenCalled();
  });

  it("кидает PasswordNotSetException, если hash нет", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        getPasswordHash: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        currentPassword: "OldPass1!",
        newPassword: "NewPass1!",
      }),
    ).rejects.toBeInstanceOf(PasswordNotSetException);
  });

  it("кидает InvalidCurrentPasswordException при неверном current", async () => {
    const { useCase, passwordHasher } = createUseCase({
      passwordHasher: createPasswordHasher({
        verify: vi.fn().mockResolvedValue(false),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        currentPassword: "wrong",
        newPassword: "NewPass1!",
      }),
    ).rejects.toBeInstanceOf(InvalidCurrentPasswordException);
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it("кидает SamePasswordException, если пароль не изменился", async () => {
    const { useCase, passwordHasher } = createUseCase({
      passwordHasher: createPasswordHasher({
        verify: vi.fn().mockResolvedValue(true),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        currentPassword: "SamePass1!",
        newPassword: "SamePass1!",
      }),
    ).rejects.toBeInstanceOf(SamePasswordException);
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it("кидает UserNotFoundException, если setPasswordHash вернул false", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        getPasswordHash: vi.fn().mockResolvedValue("old-hash"),
        setPasswordHash: vi.fn().mockResolvedValue(false),
      }),
    });

    await expect(
      useCase.execute({
        userId: user.id,
        currentPassword: "OldPass1!",
        newPassword: "NewPass1!",
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
