import { describe, expect, it, vi } from "vitest";
import {
  EmailDeliveryException,
  RateLimitedException,
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
import { StartPasswordResetUseCase } from "./StartPasswordResetUseCase.js";

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
    overrides?.passwordResetRepository ?? createPasswordResetRepository();
  const passwordHasher =
    overrides?.passwordHasher ?? createPasswordHasher();
  const emailSender = overrides?.emailSender ?? createEmailSender();
  const rateLimiter = overrides?.rateLimiter ?? allowRateLimiter();

  return {
    useCase: new StartPasswordResetUseCase(
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

describe("StartPasswordResetUseCase", () => {
  it("отправляет код и возвращает pending при новом запросе", async () => {
    const {
      useCase,
      emailSender,
      passwordHasher,
      passwordResetRepository,
      rateLimiter,
    } = createUseCase();

    const result = await useCase.execute({
      email: "  Alice@Example.com ",
      lang: "ru",
    });

    expect(result.status).toBe("pending");
    expect(result.email).toBe("alice@example.com");
    expect(result.devCode).toMatch(/^\d{6}$/);
    expect(passwordHasher.hash).toHaveBeenCalledWith(result.devCode);
    expect(emailSender.send).toHaveBeenCalledWith({
      userId: user.id,
      to: "alice@example.com",
      code: result.devCode,
      lang: "ru",
    });
    expect(rateLimiter.consume).toHaveBeenCalledWith(
      "reset:email:alice@example.com",
      3600,
    );
    expect(passwordResetRepository.upsert).toHaveBeenCalled();
  });

  it("возвращает существующий pending без повторной отправки", async () => {
    const existing = activeResetRow({
      expiresAt: futureIso(5 * 60_000),
    });
    const { useCase, emailSender, rateLimiter } = createUseCase({
      passwordResetRepository: createPasswordResetRepository({
        findByUserId: vi.fn().mockResolvedValue(existing),
      }),
    });

    const result = await useCase.execute({ email: "alice@example.com" });

    expect(result).toEqual({
      status: "pending",
      email: "alice@example.com",
      expiresAt: new Date(existing.expiresAt).toISOString(),
      resendAvailableAt: new Date(existing.resendAvailableAt).toISOString(),
    });
    expect(emailSender.send).not.toHaveBeenCalled();
    expect(rateLimiter.consume).not.toHaveBeenCalled();
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

  it("кидает RateLimitedException при превышении лимита start", async () => {
    const rateLimiter = allowRateLimiter();
    rateLimiter.check = vi
      .fn()
      .mockResolvedValue({ blocked: true, retryAfter: "2026-01-01T00:00:00.000Z" });

    const { useCase, emailSender } = createUseCase({ rateLimiter });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).rejects.toBeInstanceOf(RateLimitedException);
    expect(emailSender.send).not.toHaveBeenCalled();
  });

  it("пробрасывает EmailDeliveryException при ошибке отправки", async () => {
    const { useCase, passwordResetRepository, rateLimiter } = createUseCase({
      emailSender: createEmailSender({
        send: vi
          .fn()
          .mockRejectedValue(new EmailDeliveryException("EMAIL_DAILY_LIMIT")),
      }),
    });

    await expect(
      useCase.execute({ email: "alice@example.com" }),
    ).rejects.toBeInstanceOf(EmailDeliveryException);
    expect(rateLimiter.consume).not.toHaveBeenCalled();
    expect(passwordResetRepository.upsert).not.toHaveBeenCalled();
  });
});
