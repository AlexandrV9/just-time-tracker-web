/**
 * Провайдер не поддерживается.
 */
export class ProviderNotSupportedException extends Error {
  constructor() {
    super("PROVIDER_NOT_SUPPORTED");
    this.name = "ProviderNotSupportedException";
  }
}
