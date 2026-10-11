import type { UserLocaleDTO } from "@time-tracker/shared";
import {
  UserNotFoundException,
  type IUserRepository,
  type UserDTO,
} from "../../../domain/index.js";

export interface UpdateLocaleRequest {
  userId: string;
  locale: UserLocaleDTO;
}

export type UpdateLocaleResponse = UserDTO;

export class UpdateLocaleUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * @throws UserNotFoundException
   */
  async execute(request: UpdateLocaleRequest): Promise<UpdateLocaleResponse> {
    const updated = await this.userRepository.update({
      id: request.userId,
      locale: request.locale,
    });

    if (!updated) {
      throw new UserNotFoundException(request.userId);
    }

    return updated;
  }
}
