import {
  PasswordResetNotRequestedException,
  UserNofFoundException,
  type IPasswordResetRepository,
} from "../../../../domain/index.js";
import type { IUserRepository } from "../../../../../users/domain/index.js";
import {
  buildPendingState,
  isPasswordResetExpired,
  normalizeEmail,
  type PasswordResetPendingState,
} from "../utils.js";

export interface GetPasswordResetStatusRequest {
  email: string;
}

type PasswordResetExpiredState = { status: "expired"; email: string };

export type GetPasswordResetStatusResponse =
  | PasswordResetExpiredState
  | PasswordResetPendingState;

/**
 * Сценарий: получение статуса password-reset запроса.
 */
export class GetPasswordResetStatusUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordResetRepository: IPasswordResetRepository,
  ) {}

  /**
   * @throws UserNofFoundException
   * @throws PasswordResetNotRequestedException если запроса на сброс не было
   */
  async execute(
    request: GetPasswordResetStatusRequest,
  ): Promise<GetPasswordResetStatusResponse> {
    const email = normalizeEmail(request.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNofFoundException();
    }

    const row = await this.passwordResetRepository.findByUserId(user.id);
    if (!row) {
      throw new PasswordResetNotRequestedException();
    }

    if (isPasswordResetExpired(row)) {
      return { status: "expired", email };
    }

    return buildPendingState(email, row);
  }
}
