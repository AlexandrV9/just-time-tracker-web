import {
  ResetCodeNotFoundException,
  ResetTokenInvalidException,
  SamePasswordException,
  UserNofFoundException,
  type IPasswordResetRepository,
  type IPasswordResetTokenCodec,
} from "../../../../domain/index.js";
import type {
  IPasswordHasher,
  IUserRepository,
} from "../../../../../users/domain/index.js";
import { isPasswordResetExpired } from "../utils.js";

export interface ConfirmPasswordResetRequest {
  resetToken: string;
  newPassword: string;
}

export type ConfirmPasswordResetResponse =
  | { status: "success" }
  | { status: "expired" };

/**
 * Сценарий: установка нового пароля после verify.
 */
export class ConfirmPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetRepository: IPasswordResetRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly passwordResetTokenCodec: IPasswordResetTokenCodec,
  ) {}

  /**
   * @throws ResetTokenInvalidException
   * @throws ResetCodeNotFoundException
   * @throws SamePasswordException
   * @throws UserNofFoundException
   */
  async execute({
    resetToken,
    newPassword,
  }: ConfirmPasswordResetRequest): Promise<ConfirmPasswordResetResponse> {
    const decoded = this.passwordResetTokenCodec.decode(resetToken);
    if (!decoded) {
      throw new ResetTokenInvalidException();
    }

    const { userId } = decoded;
    const row = await this.passwordResetRepository.findByUserId(userId);
    if (!row) {
      throw new ResetCodeNotFoundException();
    }

    if (isPasswordResetExpired(row)) {
      await this.passwordResetRepository.deleteByUserId(userId);
      return { status: "expired" };
    }

    const currentPasswordHash =
      await this.userRepository.getPasswordHash(userId);
    if (!currentPasswordHash) {
      throw new UserNofFoundException();
    }

    const isSamePassword = await this.passwordHasher.verify(
      newPassword,
      currentPasswordHash,
    );
    if (isSamePassword) {
      throw new SamePasswordException();
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword);
    const isSuccess = await this.userRepository.setPasswordHash(
      userId,
      newPasswordHash,
    );

    if (!isSuccess) {
      throw new UserNofFoundException();
    }

    await this.passwordResetRepository.deleteByUserId(userId);

    return { status: "success" };
  }
}
