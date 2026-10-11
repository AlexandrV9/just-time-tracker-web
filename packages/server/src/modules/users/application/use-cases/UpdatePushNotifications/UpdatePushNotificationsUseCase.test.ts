import { describe, expect, it, vi } from "vitest";
import { UserNotFoundException } from "../../../domain/index.js";
import {
  createPushCleaner,
  createUserRepository,
  user,
} from "../testFixtures.js";
import { UpdatePushNotificationsUseCase } from "./UpdatePushNotificationsUseCase.js";

const createUseCase = (overrides?: {
  userRepository?: ReturnType<typeof createUserRepository>;
  pushCleaner?: ReturnType<typeof createPushCleaner>;
}) => {
  const userRepository = overrides?.userRepository ?? createUserRepository();
  const pushCleaner = overrides?.pushCleaner ?? createPushCleaner();

  return {
    useCase: new UpdatePushNotificationsUseCase(userRepository, pushCleaner),
    userRepository,
    pushCleaner,
  };
};

describe("UpdatePushNotificationsUseCase", () => {
  it("включает push и не чистит подписки", async () => {
    const updated = { ...user, pushNotificationsEnabled: true };
    const { useCase, userRepository, pushCleaner } = createUseCase({
      userRepository: createUserRepository({
        update: vi.fn().mockResolvedValue(updated),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, enabled: true }),
    ).resolves.toEqual(updated);
    expect(userRepository.update).toHaveBeenCalledWith({
      id: user.id,
      pushNotificationsEnabled: true,
    });
    expect(pushCleaner.deleteByUserId).not.toHaveBeenCalled();
  });

  it("выключает push и удаляет подписки", async () => {
    const updated = { ...user, pushNotificationsEnabled: false };
    const { useCase, pushCleaner } = createUseCase({
      userRepository: createUserRepository({
        update: vi.fn().mockResolvedValue(updated),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, enabled: false }),
    ).resolves.toEqual(updated);
    expect(pushCleaner.deleteByUserId).toHaveBeenCalledWith(user.id);
  });

  it("кидает UserNotFoundException, если пользователь не найден", async () => {
    const { useCase, pushCleaner } = createUseCase({
      userRepository: createUserRepository({
        update: vi.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      useCase.execute({ userId: user.id, enabled: false }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
    expect(pushCleaner.deleteByUserId).not.toHaveBeenCalled();
  });
});
