import { createHmac, timingSafeEqual } from "node:crypto";
import { config } from "shared/index.js";
import type { IPasswordResetTokenCodec } from "../domain/index.js";

export class PasswordResetTokenCodec implements IPasswordResetTokenCodec {
  /**
   * Вычисляет HMAC-подпись строки
   */
  private sign(data: string) {
    return createHmac("sha256", config.auth.resetPasswordToken.secret)
      .update(data)
      .digest("hex");
  }

  /**
   * Cоздаёт подписанный токен для сброса пароля (или верификации email).
   */
  encode(userId: string): string {
    // Получаем дату когда токен протухнет
    const exp = Date.now() + config.email.verification.codeTtlSec * 1000;

    // Переводим данные в формат base64url
    const payload = Buffer.from(JSON.stringify({ userId, exp })).toString(
      "base64url",
    );

    // Вычисляем HMAC-SHA256 подись от payload
    const signature = this.sign(payload);

    return `${payload}.${signature}`;
  }

  /**
   * Проверяет подлинность переданного токена и срок его действия, и если всё ок,
   * то возвращает userId, иначе null
   */
  decode(token: string): { userId: string } | null {
    try {
      // Если в переданном token нету точки, то это не валидный токен
      const dot = token.lastIndexOf(".");
      if (dot === -1) return null;

      const payload = token.slice(0, dot);
      const signature = token.slice(dot + 1);

      // Пересчитываем HMAC-SHA256 подпись от payload
      const expected = this.sign(payload);

      // Если подписи не совпали, то это не валидный кейс
      if (
        signature.length !== expected.length ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      ) {
        return null;
      }

      // Декодируем payload (Обратная операция к encode)
      const { userId, exp } = JSON.parse(
        Buffer.from(payload, "base64url").toString(),
      ) as { userId: string; exp: number };

      // Валидация данных, если что-то не так, то это не валидный кейс
      if (
        typeof userId !== "string" ||
        typeof exp !== "number" ||
        exp <= Date.now()
      ) {
        return null;
      }

      // Если все гуд, то возвращаем userId
      return { userId };
    } catch {
      // При любых ошибках, возвращаем null
      return null;
    }
  }
}
