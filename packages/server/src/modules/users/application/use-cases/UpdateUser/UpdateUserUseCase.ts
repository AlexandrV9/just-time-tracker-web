import type { UserLocaleDTO } from "@time-tracker/shared";
import {
  UserAlreadyExistsException,
  UserNotFoundException,
  type IUserRepository,
} from "../../../domain/index.js";

/**
 * Входные данные для сценария обновления профиля.
 */
export interface UpdateUserRequest {
  userId: string;
  name: string;
  login: string;
}

/**
 * Результат успешного обновления профиля (публичные поля).
 */
export interface UpdateUserResponse {
  id: string;
  name: string;
  login: string;
  email: string | null;
  avatar: string | null;
  locale: UserLocaleDTO;
  pushNotificationsEnabled: boolean;
}

/**
 * Сценарий использования: обновление имени и логина текущего пользователя.
 */
export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @throws UserAlreadyExistsException если login занят другим пользователем
   * @throws UserNotFoundException если пользователь не найден / неактивен
   */
  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const existingByLogin = await this.userRepository.findByLogin(
      request.login,
    );

    if (existingByLogin && existingByLogin.id !== request.userId) {
      throw new UserAlreadyExistsException(request.login);
    }

    const updatedUser = await this.userRepository.update({
      id: request.userId,
      name: request.name,
      login: request.login,
    });

    if (!updatedUser) {
      throw new UserNotFoundException(request.userId);
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      login: updatedUser.login,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      locale: updatedUser.locale,
      pushNotificationsEnabled: updatedUser.pushNotificationsEnabled,
    };
  }
}
