import {
  InvalidCurrentPasswordException,
  PasswordNotSetException,
  SamePasswordException,
  UserNotFoundException,
  WeakPasswordException,
  type IPasswordHasher,
  type IPasswordPolicyStrategy,
  type IUserRepository,
} from "../../../domain/index.js";

export interface UpdatePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class UpdatePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly passwordPolicy: IPasswordPolicyStrategy,
  ) {}

  /**
   * @throws WeakPasswordException
   * @throws PasswordNotSetException
   * @throws InvalidCurrentPasswordException
   * @throws SamePasswordException
   * @throws UserNotFoundException
   */
  async execute(request: UpdatePasswordRequest): Promise<void> {
    const violations = this.passwordPolicy.validate(request.newPassword);
    if (violations.length > 0) {
      throw new WeakPasswordException(violations);
    }

    const existingHash = await this.userRepository.getPasswordHash(
      request.userId,
    );
    if (!existingHash) {
      throw new PasswordNotSetException();
    }

    const isValidCurrent = await this.passwordHasher.verify(
      request.currentPassword,
      existingHash,
    );
    if (!isValidCurrent) {
      throw new InvalidCurrentPasswordException();
    }

    const isSame = await this.passwordHasher.verify(
      request.newPassword,
      existingHash,
    );
    if (isSame) {
      throw new SamePasswordException();
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
