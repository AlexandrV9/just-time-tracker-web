export class DuplicateActivityTitleError extends Error {
  constructor() {
    super("DUPLICATE_ACTIVITY_TITLE");
    this.name = "DuplicateActivityTitleError";
  }
}
