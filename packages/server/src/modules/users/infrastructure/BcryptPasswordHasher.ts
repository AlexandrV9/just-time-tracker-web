import bcrypt from "bcrypt";
import type { IPasswordHasher } from "../domain/index.js";

/** Cost factor — как в tokenService.generatePasswordHash */
const BCRYPT_ROUNDS = 12;

/**
 * Реализация хэширования паролей на bcrypt.
 * Совместима с существующими password_hash в БД и tokenService.
 */
export class BcryptPasswordHasher implements IPasswordHasher {
  /**
   * Хэширует пароль через bcrypt (соль внутри хэша).
   * @param password - открытый пароль
   * @returns bcrypt-хэш (например `$2b$12$...`)
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Проверяет пароль по сохранённому bcrypt-хэшу.
   * Async-версия bcrypt.compare (в tokenService сейчас compareSync).
   * @param password - открытый пароль
   * @param hash - bcrypt-хэш из БД
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
