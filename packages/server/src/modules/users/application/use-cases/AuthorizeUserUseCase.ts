import {
  InvalidCredentialsException,
  type IPasswordHasher,
  type ITokenIssuer,
  type IUserRepository,
  type UserDTO,
} from "../../domain/index.js";

/**
 * Входные данные для сценария авторизации.
 */
export interface AuthorizeUserRequest {
  login: string;
  password: string;
}

/**
 * Результат успешной авторизации.
 */
export interface AuthorizeUserResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

/**
 * Сценарий использования: авторизация пользователя по логину и паролю.
 */
export class AuthorizUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenIssuer: ITokenIssuer,
  ) {}

  /**
   * @throws InvalidCredentialsException если логин/пароль неверны или нет password_hash
   */
  async execute(request: AuthorizeUserRequest): Promise<AuthorizeUserResponse> {
    const user = await this.userRepository.findAuthByLogin(request.login);

    if (!user || !user.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const isValid = await this.passwordHasher.verify(
      request.password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const tokens = await this.tokenIssuer.issueTokens({
      id: user.id,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      locale: user.locale,
      pushNotificationsEnabled: user.pushNotificationsEnabled,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        locale: user.locale,
        pushNotificationsEnabled: user.pushNotificationsEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
