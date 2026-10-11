import type { IAuthProviderRepository } from "../../../../auth/domain/index.js";

export type AuthProviderListItem = {
  provider: string;
  createdAt: string;
};

export class GetAuthProvidersUseCase {
  constructor(
    private readonly authProviderRepository: IAuthProviderRepository,
  ) {}

  async execute(userId: string): Promise<AuthProviderListItem[]> {
    const providers = await this.authProviderRepository.findByUserId(userId);
    return providers.map((p) => ({
      provider: p.provider,
      createdAt: p.createdAt,
    }));
  }
}
