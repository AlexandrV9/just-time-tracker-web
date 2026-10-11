import type { IAuthProviderRepository } from "../../../../auth/domain/index.js";
import {
  NeedPasswordBeforeUnlinkException,
  ProviderNotLinkedException,
  ProviderNotSupportedException,
  type IUserRepository,
} from "../../../domain/index.js";

const SUPPORTED_PROVIDERS = ["yandex"];

export interface UnlinkProviderRequest {
  userId: string;
  provider: string;
}

export class UnlinkProviderUseCase {
  constructor(
    private readonly authProviderRepository: IAuthProviderRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  /**
   * @throws ProviderNotSupportedException
   * @throws ProviderNotLinkedException
   * @throws NeedPasswordBeforeUnlinkException
   */
  async execute(request: UnlinkProviderRequest): Promise<void> {
    if (!SUPPORTED_PROVIDERS.includes(request.provider)) {
      throw new ProviderNotSupportedException();
    }

    const providers = await this.authProviderRepository.findByUserId(
      request.userId,
    );
    const hasThisProvider = providers.some(
      (p) => p.provider === request.provider,
    );

    if (!hasThisProvider) {
      throw new ProviderNotLinkedException();
    }

    const passwordHash = await this.userRepository.getPasswordHash(
      request.userId,
    );
    const hasPassword = Boolean(passwordHash);
    const hasOtherProviders = providers.some(
      (p) => p.provider !== request.provider,
    );

    if (!hasPassword && !hasOtherProviders) {
      throw new NeedPasswordBeforeUnlinkException();
    }

    await this.authProviderRepository.disconnect(
      request.userId,
      request.provider,
    );
  }
}
