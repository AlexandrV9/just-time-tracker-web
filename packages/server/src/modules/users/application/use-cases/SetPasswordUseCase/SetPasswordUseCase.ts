import {
  PasswordAlreadySetException,
  UserNotFoundException,
  WeakPasswordException,
  type IPasswordHasher,
  type IPasswordPolicyStrategy,
  type IUserRepository,
} from "../../../domain/index.js";

export interface SetPasswordRequest {
  userId: string;
  newPassword: string;
}

export class SetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly passwordPolicy: IPasswordPolicyStrategy,
  ) {}

  /**
   * @throws WeakPasswordException
   * @throws PasswordAlreadySetException
   * @throws UserNotFoundException
   */
  async execute(request: SetPasswordRequest): Promise<void> {
    const violations = this.passwordPolicy.validate(request.newPassword);
    if (violations.length > 0) {
      throw new WeakPasswordException(violations);
    }

    const existingHash = await this.userRepository.getPasswordHash(
      request.userId,
    );
    if (existingHash) {
      throw new PasswordAlreadySetException();
    }

    const passwordHash = await this.passwordHasher.hash(request.newPassword);
    const updated = await this.userRepository.setPasswordHash(
      request.userId,
      passwordHash,
    );

    if (!updated) {
      throw new UserNotFoundException(request.userId);
    }
  }
}
