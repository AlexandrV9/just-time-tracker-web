import { describe, expect, it, vi } from "vitest";
import {
  ResetCodeNotFoundException,
  ResetTokenInvalidException,
  SamePasswordException,
  UserNofFoundException,
} from "../../../../domain/index.js";
import {
  activeResetRow,
  createPasswordHasher,
  createPasswordResetRepository,
  createTokenCodec,
  createUserRepository,
  pastIso,
  user,
} from "../testFixtures.js";
import { ConfirmPasswordResetUseCase } from "./ConfirmPasswordResetUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
  passwordResetRepository?: ReturnType<typeof createPasswordResetRepository>;
  passwordHasher?: ReturnType<typeof createPasswordHasher>;
  tokenCodec?: ReturnType<typeof createTokenCodec>;
}) => {
  const userRepository =
    overrides?.userRepository ?? createUserRepository();
  const passwordResetRepository =
    overrides?.passwordResetRepository ??
    createPasswordResetRepository({
      findByUserId: vi.fn().mockResolvedValue(activeResetRow()),
    });
  const passwordHasher =
    overrides?.passwordHasher ??
    createPasswordHasher({
      verify: vi.fn().mockResolvedValue(false),
      hash: vi.fn().mockResolvedValue("new-hash"),
    });
  const tokenCodec = overrides?.tokenCodec ?? createTokenCodec();

  return {
    useCase: new ConfirmPasswordResetUseCase(
      userRepository,
      passwordResetRepository,
      passwordHasher,
      tokenCodec,
    ),
    userRepository,
    passwordResetRepository,
    passwordHasher,
    tokenCodec,
  };
};

describe("ConfirmPasswordResetUseCase", () => {
  it("ставит новый пароль и удаляет challenge", async () => {
    const {
      useCase,
      userRepository,
      passwordResetRepository,
      passwordHasher,
    } = createUseCase();

    await expect(
      useCase.execute({
        resetToken: "token",
        newPassword: "NewPass1!",
      }),
    ).resolves.toEqual({ status: "success" });

    expect(passwordHasher.hash).toHaveBeenCalledWith("NewPass1!");
    expect(userRepository.setPasswordHash).toHaveBeenCalledWith(
      user.id,
      "new-hash",
    );
    expect(passwordResetRepository.deleteByUserId).toHaveBeenCalledWith(
      user.id,
    );
  });

  it("возвращает expired и удаляет challenge, если код протух", async () => {
    const passwordResetRepository = createPasswordResetRepository({
      findByUserId: vi
        .fn()
        .mockResolvedValue(activeResetRow({ expiresAt: pastIso(1_000) })),
    });
    const { useCase, userRepository } = createUseCase({
      passwordResetRepository,
    });

    await expect(
      useCase.execute({ resetToken: "token", newPassword: "NewPass1!" }),
    ).resolves.toEqual({ status: "expired" });
    expect(passwordResetRepository.deleteByUserId).toHaveBeenCalledWith(
      user.id,
    );
    expect(userRepository.setPasswordHash).not.toHaveBeenCalled();
  });

  it("кидает ResetTokenInvalidException при битом токене", async () => {
    const { useCase } = createUseCase({
      tokenCodec: createTokenCodec({
        decode: vi.fn().mockReturnValue(null),
      }),
    });

    await expect(
      useCase.execute({ resetToken: "bad", newPassword: "NewPass1!" }),
    ).rejects.toBeInstanceOf(ResetTokenInvalidException);
  });

  it("кидает ResetCodeNotFoundException, если challenge нет", async () => {
    const { useCase } = createUseCase({
      passwordResetRepository: createPasswordResetRepository({
        findByUserId: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ resetToken: "token", newPassword: "NewPass1!" }),
    ).rejects.toBeInstanceOf(ResetCodeNotFoundException);
  });

  it("кидает SamePasswordException, если пароль не изменился", async () => {
    const { useCase, userRepository } = createUseCase({
      passwordHasher: createPasswordHasher({
        verify: vi.fn().mockResolvedValue(true),
      }),
    });

    await expect(
      useCase.execute({ resetToken: "token", newPassword: "OldPass1!" }),
    ).rejects.toBeInstanceOf(SamePasswordException);
    expect(userRepository.setPasswordHash).not.toHaveBeenCalled();
  });

  it("кидает UserNofFoundException, если нет текущего passwordHash", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        getPasswordHash: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ resetToken: "token", newPassword: "NewPass1!" }),
    ).rejects.toBeInstanceOf(UserNofFoundException);
  });
});
