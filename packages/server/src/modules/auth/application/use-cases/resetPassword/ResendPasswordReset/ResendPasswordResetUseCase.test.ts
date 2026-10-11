import { describe, expect, it, vi } from "vitest";
import {
  EmailDeliveryException,
  ResendTooEarlyException,
  ResetCodeNotFoundException,
  TooManyAttemptsException,
  UserNofFoundException,
} from "../../../../domain/index.js";
import {
  activeResetRow,
  allowRateLimiter,
  createEmailSender,
  createPasswordHasher,
  createPasswordResetRepository,
  createUserRepository,
  futureIso,
  policy,
  user,
} from "../testFixtures.js";
import { ResendPasswordResetUseCase } from "./ResendPasswordResetUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
  passwordResetRepository?: ReturnType<typeof createPasswordResetRepository>;
  passwordHasher?: ReturnType<typeof createPasswordHasher>;
  emailSender?: ReturnType<typeof createEmailSender>;
  rateLimiter?: ReturnType<typeof allowRateLimiter>;
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
  const emailSender = overrides?.emailSender ?? createEmailSender();
  const rateLimiter = overrides?.rateLimiter ?? allowRateLimiter();

  return {
    useCase: new ResendPasswordResetUseCase(
      userRepository,
      passwordResetRepository,
      passwordHasher,
      emailSender,
      rateLimiter,
      overrides?.policy ?? policy,
    ),
    userRepository,
    passwordResetRepository,
    passwordHasher,
    emailSender,
    rateLimiter,
  };
};

describe("ResendPasswordResetUseCase", () => {
  it("переотправляет код через refreshForResend при существующем challenge", async () => {
    const passwordResetRepository = createPasswordResetRepository({
      findByUserId: vi.fn().mockResolvedValue(activeResetRow()),
    });
    const { useCase, emailSender } = createUseCase({
      passwordResetRepository,
    });

    const result = await useCase.execute({
      email: "alice@example.com",
      lang: "en",
    });

    expect(result.status).toBe("pending");
    expect(result.devCode).toMatch(/^\d{6}$/);
    expect(emailSender.send).toHaveBeenCalledWith({
      userId: user.id,
      to: "alice@example.com",
      code: result.devCode,
      lang: "en",
    });
    expect(passwordResetRepository.refreshForResend).toHaveBeenCalled();
    expect(passwordResetRepository.upsert).not.toHaveBeenCalled();
  });

  it("делает upsert, если challenge ещё не было", async () => {
    const passwordResetRepository = createPasswordResetRepository({
      findByUserId: vi.fn().mockResolvedValue(null),
    });
    const { useCase } = createUseCase({ passwordResetRepository });

    await useCase.execute({ email: "alice@example.com" });

    expect(passwordResetRepository.upsert).toHaveBeenCalled();
    expect(passwordResetRepository.refreshForResend).not.toHaveBeenCalled();
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

  it("кидает TooManyAttemptsException при активном lockout", async () => {
    const rateLimiter = allowRateLimiter();
    rateLimiter.checkLocked = vi.fn().mockResolvedValue({
      blocked: true,
      retryAfter: "2026-01-01T00:00:00.000Z",
    });

    const { useCase, emailSender } = createUseCase({ rateLimiter });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).rejects.toBeInstanceOf(TooManyAttemptsException);
    expect(emailSender.send).not.toHaveBeenCalled();
  });

  it("кидает ResendTooEarlyException, если cooldown ещё активен", async () => {
    const { useCase, emailSender } = createUseCase({
      passwordResetRepository: createPasswordResetRepository({
        findByUserId: vi.fn().mockResolvedValue(
          activeResetRow({ resendAvailableAt: futureIso(60_000) }),
        ),
      }),
    });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).rejects.toBeInstanceOf(ResendTooEarlyException);
    expect(emailSender.send).not.toHaveBeenCalled();
  });

  it("кидает ResetCodeNotFoundException, если refreshForResend вернул null", async () => {
    const { useCase } = createUseCase({
      passwordResetRepository: createPasswordResetRepository({
        findByUserId: vi.fn().mockResolvedValue(activeResetRow()),
        refreshForResend: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).rejects.toBeInstanceOf(ResetCodeNotFoundException);
  });

  it("пробрасывает EmailDeliveryException при ошибке отправки", async () => {
    const { useCase, passwordResetRepository } = createUseCase({
      emailSender: createEmailSender({
        send: vi
          .fn()
          .mockRejectedValue(new EmailDeliveryException("EMAIL_DAILY_LIMIT")),
      }),
    });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).rejects.toBeInstanceOf(EmailDeliveryException);
    expect(passwordResetRepository.refreshForResend).not.toHaveBeenCalled();
  });
});
