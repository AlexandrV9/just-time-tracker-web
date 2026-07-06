export const logDevCode = (devCode?: string) => {
  if (devCode) {
    console.info("[dev] password reset code:", devCode);
  }
};

export const mapStartErrorKey = (message?: string) => {
  switch (message) {
    case "USER_NOT_FOUND":
      return "errors.userNotFound";
    case "EMAIL_DAILY_LIMIT":
      return "errors.dailyLimit";
    case "RATE_LIMITED":
      return "errors.rateLimited";
    default:
      return "errors.requestFailed";
  }
};

export const mapCodeErrorKey = (message?: string) => {
  switch (message) {
    case "INVALID_CODE":
      return "errors.invalidCode";
    case "TOO_MANY_ATTEMPTS":
      return "errors.tooManyAttempts";
    default:
      return "errors.verifyFailed";
  }
};
