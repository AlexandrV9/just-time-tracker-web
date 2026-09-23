/**
 * Доменное исключение: не удалось отправить email (доставка / дневной лимит).
 */
export class EmailDeliveryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryException";
  }
}
