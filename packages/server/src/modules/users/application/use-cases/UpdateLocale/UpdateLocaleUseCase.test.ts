import { describe, expect, it, vi } from "vitest";
import { UserNotFoundException } from "../../../domain/index.js";
import { createUserRepository, user } from "../testFixtures.js";
import { UpdateLocaleUseCase } from "./UpdateLocaleUseCase.js";

describe("UpdateLocaleUseCase", () => {
  it("обновляет locale", async () => {
    const updated = { ...user, locale: "ru" as const };
    const userRepository = createUserRepository({
      update: vi.fn().mockResolvedValue(updated),
    });
    const useCase = new UpdateLocaleUseCase(userRepository);

    await expect(
      useCase.execute({ userId: user.id, locale: "ru" }),
    ).resolves.toEqual(updated);
    expect(userRepository.update).toHaveBeenCalledWith({
      id: user.id,
      locale: "ru",
    });
  });

  it("кидает UserNotFoundException, если пользователь не найден", async () => {
    const useCase = new UpdateLocaleUseCase(
      createUserRepository({
        update: vi.fn().mockResolvedValue(null),
      }),
    );

    await expect(
      useCase.execute({ userId: user.id, locale: "ru" }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
