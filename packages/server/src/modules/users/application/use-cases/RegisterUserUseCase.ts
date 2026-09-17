import {
  UserAlreadyExistsException,
  WeakPasswordException,
  type CreateUserDataDTO,
  type IPasswordHasher,
  type IPasswordPolicyStrategy,
  type IUserRepository,
} from "../../domain/index.js";

/**
 * Входные данные для сценария регистрации пользователя.
 */
export interface RegisterUserRequest {
  /** Имя пользователя */
  firstName: string;
  /** Логин пользователя */
  login: string;
  /** Пароль в открытом виде */
  password: string;
}

/**
 * Результат успешной регистрации пользователя.
 */
export interface RegisterUserResponse {
  /** Уникальный идентификатор созданного пользователя */
  id: string;
  /** Логин созданного пользователя */
  login: string;
  /** Имя созданного пользователя */
  name: string;
  /** Дата и время создания в формате ISO 8601 */
  createdAt: string;
}

/**
 * Сценарий использования: регистрация нового пользователя.
 * Оркестрирует проверку политики пароля, уникальности email,
 * хэширование пароля и сохранение сущности.
 */
export class RegisterUserUseCase {
  /**
   * @param userRepository - порт репозитория пользователей
   * @param passwordHasher - порт хэширования паролей
   * @param passwordPolicy - стратегия проверки политики паролей
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly passwordPolicy: IPasswordPolicyStrategy,
  ) {}

  /**
   * Выполняет регистрацию нового пользователя.
   * @param request - входные данные с email и паролем
   * @returns данные созданного пользователя
   * @throws WeakPasswordException если пароль не соответствует политике
   * @throws UserAlreadyExistsException если email уже занят
   */
  async execute(request: RegisterUserRequest): Promise<RegisterUserResponse> {
    const violations = this.passwordPolicy.validate(request.password);

    if (violations.length > 0) {
      throw new WeakPasswordException(violations);
    }

    const existing = await this.userRepository.findByLogin(request.login);
    if (existing) {
      throw new UserAlreadyExistsException(request.login);
    }

    const passwordHash = await this.passwordHasher.hash(request.password);

    const user: CreateUserDataDTO = {
      firstName: request.firstName,
      login: request.login,
      passwordHash,
    };

    const createdUser = await this.userRepository.save(user);

    return {
      id: createdUser.id,
      login: createdUser.login,
      name: createdUser.name,
      createdAt: createdUser.createdAt,
    };
  }
}
