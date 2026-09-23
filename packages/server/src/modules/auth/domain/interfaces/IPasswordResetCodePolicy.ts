/**
 * Параметры политики reset-кода (TTL / cooldown / лимиты).
 */
export type IPasswordResetCodePolicy = {
  /**
   * Время жизни кода подтверждения в секундах
   */
  codeTtlSec: number;
  /**
   * Пауза (сек) между повторными отправками кода (resend)
   */
  resendCooldownSec: number;
  /**
   * Макс. число start password-reset на один email за час
   */
  maxStartsPerHourPerEmail: number;
  /**
   * Макс. число неудачных попыток ввода кода до сброса/блокировки challenge
   */
  maxAttempts: number;
  /**
   * Отдавать код в API-ответе (только console/dev транспорт)
   */
  exposeDevCode: boolean;
};
