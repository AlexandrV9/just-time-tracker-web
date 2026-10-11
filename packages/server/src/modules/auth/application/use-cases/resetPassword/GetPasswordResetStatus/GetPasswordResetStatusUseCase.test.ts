import { describe, expect, it, vi } from "vitest";
import {
  PasswordResetNotRequestedException,
  UserNofFoundException,
} from "../../../../domain/index.js";
import {
  activeResetRow,
  createPasswordResetRepository,
  createUserRepository,
  pastIso,
} from "../testFixtures.js";
import { GetPasswordResetStatusUseCase } from "./GetPasswordResetStatusUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
  passwordResetRepository?: ReturnType<typeof createPasswordResetRepository>;
}) => {
  const userRepository =
    overrides?.userRepository ?? createUserRepository();
  const passwordResetRepository =
    overrides?.passwordResetRepository ?? createPasswordResetRepository();

  return {
    useCase: new GetPasswordResetStatusUseCase(
      userRepository,
      passwordResetRepository,
    ),
    userRepository,
    passwordResetRepository,
  };
};

describe("GetPasswordResetStatusUseCase", () => {
  it("возвращает pending для активного challenge", async () => {
    const row = activeResetRow();
    const { useCase } = createUseCase({
      passwordResetRepository: createPasswordResetRepository({
        findByUserId: vi.fn().mockResolvedValue(row),
      }),
    });

    await expect(
      useCase.execute({ email: "  Alice@Example.com " }),
    ).resolves.toEqual({
      status: "pending",
      email: "alice@example.com",
      expiresAt: new Date(row.expiresAt).toISOString(),
      resendAvailableAt: new Date(row.resendAvailableAt).toISOString(),
    });
  });

  it("возвращает expired для протухшего challenge", async () => {
    const { useCase } = createUseCase({
      passwordResetRepository: createPasswordResetRepository({
        findByUserId: vi.fn().mockResolvedValue(
          activeResetRow({ expiresAt: pastIso(1_000) }),
        ),
      }),
    });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).resolves.toEqual({
      status: "expired",
      email: "alice@example.com",
    });
  });

  it("кидает UserNofFoundException, если email не найден", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        findByEmail: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ email: "missing@example.com" }),
    ).rejects.toBeInstanceOf(UserNofFoundException);
  });

  it("кидает PasswordResetNotRequestedException, если challenge нет", async () => {
    const { useCase } = createUseCase({
      passwordResetRepository: createPasswordResetRepository({
        findByUserId: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).rejects.toBeInstanceOf(PasswordResetNotRequestedException);
  });
});
