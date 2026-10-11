import {
  type AuthUserPayload,
  type IJwtAuthTokenManager,
} from "../../../domain/index.js";
import {
  UserAlreadyExistsException,
  WeakPasswordException,
  type CreateUserDataDTO,
  type IPasswordHasher,
  type IPasswordPolicyStrategy,
  type IUserRepository,
} from "../../../../users/domain/index.js";

export interface SignUpRequest {
  firstName: string;
  login: string;
  password: string;
}

export interface SignUpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
}

/**
 * Сценарий: регистрация.
 */
export class SignUpUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly passwordPolicy: IPasswordPolicyStrategy,
    private readonly jwtAuthTokenManager: IJwtAuthTokenManager,
  ) {}

  /**
   * @throws WeakPasswordException
   * @throws UserAlreadyExistsException
   */
  async execute(request: SignUpRequest): Promise<SignUpResponse> {
    const violations = this.passwordPolicy.validate(request.password);
    if (violations.length > 0) {
      throw new WeakPasswordException(violations);
    }

    const existing = await this.userRepository.findByLogin(request.login);
    if (existing) {
      throw new UserAlreadyExistsException(request.login);
    }

    const passwordHash = await this.passwordHasher.hash(request.password);

    const createData: CreateUserDataDTO = {
      firstName: request.firstName,
      login: request.login,
      passwordHash,
    };

    const created = await this.userRepository.save(createData);

    const authUser: AuthUserPayload = {
      id: created.id,
      login: created.login,
      name: created.name,
      avatar: created.avatar,
      email: created.email,
      locale: created.locale,
      pushNotificationsEnabled: created.pushNotificationsEnabled,
    };

    const tokens = await this.jwtAuthTokenManager.generateTokens(authUser);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: authUser,
    };
  }
}
