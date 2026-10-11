import { describe, expect, it, vi } from "vitest";
import { createAuthProviderRepository, user } from "../testFixtures.js";
import { GetAuthProvidersUseCase } from "./GetAuthProvidersUseCase.js";

describe("GetAuthProvidersUseCase", () => {
  it("возвращает список провайдеров без внутренних полей", async () => {
    const authProviderRepository = createAuthProviderRepository({
      findByUserId: vi.fn().mockResolvedValue([
        {
          id: "p1",
          userId: user.id,
          provider: "yandex",
          providerUserId: "yandex-1",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    });
    const useCase = new GetAuthProvidersUseCase(authProviderRepository);

    await expect(useCase.execute(user.id)).resolves.toEqual([
      {
        provider: "yandex",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    expect(authProviderRepository.findByUserId).toHaveBeenCalledWith(user.id);
  });

  it("возвращает пустой список, если провайдеров нет", async () => {
    const useCase = new GetAuthProvidersUseCase(createAuthProviderRepository());

    await expect(useCase.execute(user.id)).resolves.toEqual([]);
  });
});
