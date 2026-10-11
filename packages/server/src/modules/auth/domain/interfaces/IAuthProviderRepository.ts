export type AuthProviderRecord = {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
  createdAt: string;
};

/**
 * Порт хранилища auth_providers (linked OAuth).
 */
export interface IAuthProviderRepository {
  findByUserId(userId: string): Promise<AuthProviderRecord[]>;
  disconnect(userId: string, provider: string): Promise<boolean>;
}
