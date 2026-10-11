import { describe, expect, it, vi } from "vitest";
import {
  NeedPasswordBeforeUnlinkException,
  ProviderNotLinkedException,
  ProviderNotSupportedException,
} from "../../../domain/index.js";
import {
  createAuthProviderRepository,
  createUserRepository,
  user,
} from "../testFixtures.js";
import { UnlinkProviderUseCase } from "./UnlinkProviderUseCase.js";

const yandexProvider = {
  id: "p1",
  userId: user.id,
  provider: "yandex",
  providerUserId: "yandex-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const createUseCase = (overrides?: {
  authProviderRepository?: ReturnType<typeof createAuthProviderRepository>;
  userRepository?: ReturnType<typeof createUserRepository>;
}) => {
  const authProviderRepository =
    overrides?.authProviderRepository ??
    createAuthProviderRepository({
      findByUserId: vi.fn().mockResolvedValue([yandexProvider]),
    });
  const userRepository =
    overrides?.userRepository ??
    createUserRepository({
      getPasswordHash: vi.fn().mockResolvedValue("hash"),
    });

  return {
    useCase: new UnlinkProviderUseCase(authProviderRepository, userRepository),
    authProviderRepository,
    userRepository,
  };
};

describe("UnlinkProviderUseCase", () => {
  it("отвязывает yandex, если есть пароль", async () => {
    const { useCase, authProviderRepository } = createUseCase();

    await expect(
      useCase.execute({ userId: user.id, provider: "yandex" }),
    ).resolves.toBeUndefined();
    expect(authProviderRepository.disconnect).toHaveBeenCalledWith(
      user.id,
      "yandex",
    );
  });

  it("кидает ProviderNotSupportedException для неизвестного provider", async () => {
    const { useCase, authProviderRepository } = createUseCase();

    await expect(
      useCase.execute({ userId: user.id, provider: "google" }),
    ).rejects.toBeInstanceOf(ProviderNotSupportedException);
    expect(authProviderRepository.findByUserId).not.toHaveBeenCalled();
  });

  it("кидает ProviderNotLinkedException, если провайдер не привязан", async () => {
    const { useCase, authProviderRepository } = createUseCase({
      authProviderRepository: createAuthProviderRepository({
        findByUserId: vi.fn().mockResolvedValue([]),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, provider: "yandex" }),
    ).rejects.toBeInstanceOf(ProviderNotLinkedException);
    expect(authProviderRepository.disconnect).not.toHaveBeenCalled();
  });

  it("кидает NeedPasswordBeforeUnlinkException без пароля и других провайдеров", async () => {
    const { useCase, authProviderRepository } = createUseCase({
      userRepository: createUserRepository({
        getPasswordHash: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, provider: "yandex" }),
    ).rejects.toBeInstanceOf(NeedPasswordBeforeUnlinkException);
    expect(authProviderRepository.disconnect).not.toHaveBeenCalled();
  });

  it("разрешает unlink единственного провайдера, если есть пароль", async () => {
    const { useCase } = createUseCase({
      userRepository: createUserRepository({
        getPasswordHash: vi.fn().mockResolvedValue("hash"),
      }),
      authProviderRepository: createAuthProviderRepository({
        findByUserId: vi.fn().mockResolvedValue([yandexProvider]),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, provider: "yandex" }),
    ).resolves.toBeUndefined();
  });
});
