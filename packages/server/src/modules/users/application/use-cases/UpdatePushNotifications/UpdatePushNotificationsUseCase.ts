import {
  UserNotFoundException,
  type IPushSubscriptionCleaner,
  type IUserRepository,
  type UserDTO,
} from "../../../domain/index.js";

export interface UpdatePushNotificationsRequest {
  userId: string;
  enabled: boolean;
}

export type UpdatePushNotificationsResponse = UserDTO;

export class UpdatePushNotificationsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly pushSubscriptionCleaner: IPushSubscriptionCleaner,
  ) {}

  /**
   * @throws UserNotFoundException
   */
  async execute(
    request: UpdatePushNotificationsRequest,
  ): Promise<UpdatePushNotificationsResponse> {
    const updated = await this.userRepository.update({
      id: request.userId,
      pushNotificationsEnabled: request.enabled,
    });

    if (!updated) {
      throw new UserNotFoundException(request.userId);
    }

    if (!request.enabled) {
      await this.pushSubscriptionCleaner.deleteByUserId(request.userId);
    }

    return updated;
  }
}
