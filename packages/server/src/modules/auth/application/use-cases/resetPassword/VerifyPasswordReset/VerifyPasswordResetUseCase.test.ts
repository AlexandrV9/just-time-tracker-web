import { describe, expect, it, vi } from "vitest";
import {
  InvalidResetCodeException,
  TooManyAttemptsException,
} from "../../../../domain/index.js";
import {
  activeResetRow,
  allowRateLimiter,
  createPasswordHasher,
  createPasswordResetRepository,
  createTokenCodec,
  createUserRepository,
  pastIso,
  policy,
  user,
} from "../testFixtures.js";
import { VerifyPasswordResetUseCase } from "./VerifyPasswordResetUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
  passwordResetRepository?: ReturnType<typeof createPasswordResetRepository>;
  passwordHasher?: ReturnType<typeof createPasswordHasher>;
  rateLimiter?: ReturnType<typeof allowRateLimiter>;
  tokenCodec?: ReturnType<typeof createTokenCodec>;
  policy?: typeof policy;
}) => {
  const userRepository =
    overrides?.userRepository ?? createUserRepository();
  const passwordResetRepository =
    overrides?.passwordResetRepository ??
    createPasswordResetRepository({
      findByUserId: vi.fn().mockResolvedValue(activeResetRow()),
    });
  const passwordHasher =
    overrides?.passwordHasher ?? createPasswordHasher();
  const rateLimiter = overrides?.rateLimiter ?? allowRateLimiter();
  const tokenCodec = overrides?.tokenCodec ?? createTokenCodec();

  return {
    useCase: new VerifyPasswordResetUseCase(
      userRepository,
      passwordResetRepository,
      passwordHasher,
      rateLimiter,
      tokenCodec,
      overrides?.policy ?? policy,
    ),
    userRepository,
    passwordResetRepository,
    passwordHasher,
    rateLimiter,
    tokenCodec,
  };
};

describe("VerifyPasswordResetUseCase", () => {
  it("возвращает verified + resetToken при верном коде", async () => {
    const { useCase, rateLimiter, tokenCodec, passwordHasher } =
      createUseCase();

    const result = await useCase.execute({
      email: "alice@example.com",
      code: "123456",
    });

    expect(result).toEqual({
      status: "verified",
      resetToken: "reset-token",
    });
    expect(passwordHasher.verify).toHaveBeenCalledWith("123456", "code-hash");
    expect(rateLimiter.recordSuccess).toHaveBeenCalledWith([
      `verify:reset:${user.id}`,
    ]);
    expect(tokenCodec.encode).toHaveBeenCalledWith(user.id);
  });

  it("возвращает expired и удаляет challenge, если код протух", async () => {
    const passwordResetRepository = createPasswordResetRepository({
      findByUserId: vi
        .fn()
        .mockResolvedValue(activeResetRow({ expiresAt: pastIso(1_000) })),
    });
    const { useCase, passwordHasher } = createUseCase({
      passwordResetRepository,
    });

    await expect(
      useCase.execute({ email: "alice@example.com", code: "123456" }),
    ).resolves.toEqual({ status: "expired" });
    expect(passwordResetRepository.deleteByUserId).toHaveBeenCalledWith(
      user.id,
    );
    expect(passwordHasher.verify).not.toHaveBeenCalled();
  });

  it("кидает InvalidResetCodeException, если пользователь не найден", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        findByEmail: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ email: "missing@example.com", code: "123456" }),
    ).rejects.toBeInstanceOf(InvalidResetCodeException);
  });

  it("кидает TooManyAttemptsException при активном lockout", async () => {
    const rateLimiter = allowRateLimiter();
    rateLimiter.checkLocked = vi.fn().mockResolvedValue({
      blocked: true,
      retryAfter: "2026-01-01T00:00:00.000Z",
    });

    const { useCase, passwordHasher } = createUseCase({ rateLimiter });

    await expect(
      useCase.execute({ email: "alice@example.com", code: "123456" }),
    ).rejects.toBeInstanceOf(TooManyAttemptsException);
    expect(passwordHasher.verify).not.toHaveBeenCalled();
  });

  it("кидает InvalidResetCodeException при неверном коде", async () => {
    const rateLimiter = allowRateLimiter();
    const passwordResetRepository = createPasswordResetRepository({
      findByUserId: vi.fn().mockResolvedValue(activeResetRow()),
    });
    const { useCase } = createUseCase({
      passwordHasher: createPasswordHasher({
        verify: vi.fn().mockResolvedValue(false),
      }),
      passwordResetRepository,
      rateLimiter,
    });

    await expect(
      useCase.execute({ email: "alice@example.com", code: "000000" }),
    ).rejects.toBeInstanceOf(InvalidResetCodeException);
    expect(passwordResetRepository.incrementAttempts).toHaveBeenCalledWith(
      user.id,
    );
    expect(rateLimiter.recordFailure).toHaveBeenCalledWith([
      `verify:reset:${user.id}`,
    ]);
  });

  it("кидает TooManyAttemptsException, если recordFailure залочил", async () => {
    const rateLimiter = allowRateLimiter();
    rateLimiter.recordFailure = vi.fn().mockResolvedValue({
      blocked: true,
      retryAfter: "2026-01-01T00:00:00.000Z",
    });

    const { useCase } = createUseCase({
      passwordHasher: createPasswordHasher({
        verify: vi.fn().mockResolvedValue(false),
      }),
      rateLimiter,
    });

    await expect(
      useCase.execute({ email: "alice@example.com", code: "000000" }),
    ).rejects.toBeInstanceOf(TooManyAttemptsException);
  });
});
