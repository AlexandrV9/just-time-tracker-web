import { describe, expect, it, vi } from "vitest";
import {
  PasswordAlreadySetException,
  UserNotFoundException,
  WeakPasswordException,
} from "../../../domain/index.js";
import {
  createPasswordHasher,
  createPasswordPolicy,
  createUserRepository,
  user,
} from "../testFixtures.js";
import { SetPasswordUseCase } from "./SetPasswordUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
  passwordHasher?: ReturnType<typeof createPasswordHasher>;
  passwordPolicy?: ReturnType<typeof createPasswordPolicy>;
}) => {
  const userRepository = overrides?.userRepository ?? createUserRepository();
  const passwordHasher = overrides?.passwordHasher ?? createPasswordHasher();
  const passwordPolicy = overrides?.passwordPolicy ?? createPasswordPolicy();

  return {
    useCase: new SetPasswordUseCase(
      userRepository,
      passwordHasher,
      passwordPolicy,
    ),
    userRepository,
    passwordHasher,
    passwordPolicy,
  };
};

describe("SetPasswordUseCase", () => {
  it("ставит пароль, если его ещё не было", async () => {
    const { useCase, userRepository, passwordHasher, passwordPolicy } =
      createUseCase();

    await expect(
      useCase.execute({ userId: user.id, newPassword: "StrongPass1!" }),
    ).resolves.toBeUndefined();

    expect(passwordPolicy.validate).toHaveBeenCalledWith("StrongPass1!");
    expect(userRepository.getPasswordHash).toHaveBeenCalledWith(user.id);
    expect(passwordHasher.hash).toHaveBeenCalledWith("StrongPass1!");
    expect(userRepository.setPasswordHash).toHaveBeenCalledWith(
      user.id,
      "new-hash",
    );
  });

  it("кидает WeakPasswordException при слабом пароле", async () => {
    const { useCase, userRepository } = createUseCase({
      passwordPolicy: createPasswordPolicy({
        validate: vi.fn().mockReturnValue(["too short"]),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, newPassword: "weak" }),
    ).rejects.toBeInstanceOf(WeakPasswordException);
    expect(userRepository.getPasswordHash).not.toHaveBeenCalled();
  });

  it("кидает PasswordAlreadySetException, если hash уже есть", async () => {
    const { useCase, passwordHasher } = createUseCase({
      userRepository: createUserRepository({
        getPasswordHash: vi.fn().mockResolvedValue("existing"),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, newPassword: "StrongPass1!" }),
    ).rejects.toBeInstanceOf(PasswordAlreadySetException);
    expect(passwordHasher.hash).not.toHaveBeenCalled();
  });

  it("кидает UserNotFoundException, если setPasswordHash вернул false", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        setPasswordHash: vi.fn().mockResolvedValue(false),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, newPassword: "StrongPass1!" }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
