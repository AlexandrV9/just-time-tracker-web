import { randomInt } from "node:crypto";
import type { PasswordResetRecord } from "../../../domain/index.js";

/**
 * Форматирует переданную почту
 */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Генерирует 6-значный код для сброса пароля
 */
export const generateResetCode = () => randomInt(100_000, 1_000_000).toString();

/**
 * Функция проверят истек ли запрос на сброс пароля или нет.
 * @description Если время на сброс пароля истекло, то вернет true
 * @description Если есть еще время чтобы успеть сбросить пароль, то вернет false
 */
export const isPasswordResetExpired = (row: PasswordResetRecord) =>
  Date.now() >= Date.parse(row.expiresAt);

export type PasswordResetPendingState = {
  status: "pending";
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
  devCode?: string;
};

/**
 * Формирует состояние pending (сброс пароля в процессе)
 * @param email -  почта юзера, на которую отправлен код для сброса
 * @param row - это текущая попытка сброса пароля
 * @param options - это набор доп. опций, нужно для DEV (code - 6-значный код,
 * exposeDevCode - нужно для выводить код в консоль)
 * @returns
 */
export const buildPendingState = (
  email: string,
  row: PasswordResetRecord,
  options?: { code?: string; exposeDevCode?: boolean },
): PasswordResetPendingState => {
  const state: PasswordResetPendingState = {
    status: "pending",
    email,
    expiresAt: new Date(row.expiresAt).toISOString(),
    resendAvailableAt: new Date(row.resendAvailableAt).toISOString(),
  };

  if (options?.code && options.exposeDevCode) {
    state.devCode = options.code;
  }

  return state;
};

/**
 * Генерирует строковый ключ - попытка сброса пароля такой-то почты
 */
export const resetEmailRateKey = (email: string) =>
  `reset:email:${email.trim().toLowerCase()}`;

/**
 * Генерирует строковый ключ - подтверждение сброса пароля таким-то юзером
 */
export const verifyResetRateKey = (userId: string) => `verify:reset:${userId}`;
