/**
 * OAuth-провайдер не привязан к аккаунту.
 */
export class ProviderNotLinkedException extends Error {
  constructor() {
    super("PROVIDER_NOT_LINKED");
    this.name = "ProviderNotLinkedException";
  }
}
