/**
 * Сценарий: выход из системы.
 * Инвалидация refresh-cookie — ответственность presentation-слоя.
 */
export class SignOutUseCase {
  async execute(): Promise<void> {
    // Stateless JWT: серверных сессий нет.
    // Cookie очищается в AuthController.
  }
}
