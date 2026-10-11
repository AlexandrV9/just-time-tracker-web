import { describe, expect, it } from "vitest";
import { SignOutUseCase } from "./SignOutUseCase.js";

describe("SignOutUseCase", () => {
  it("успешно завершается (stateless JWT, без серверной сессии)", async () => {
    const useCase = new SignOutUseCase();

    await expect(useCase.execute()).resolves.toBeUndefined();
  });
});
