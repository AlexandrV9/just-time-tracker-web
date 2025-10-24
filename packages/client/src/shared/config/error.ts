import type { ErrorResponse } from "../api/services/types";

export class ApiError<TError = unknown> extends Error {
  public readonly code?: number;
  public readonly data?: TError;

  constructor({
    message,
    code,
    data,
  }: {
    message: string;
    code?: number;
    data?: TError;
  }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.data = data;

    // Для корректной работы с instanceof в TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse<TError>(
    responseData: Omit<ErrorResponse<TError>, "success"> & {
      code?: number;
    }
  ) {
    return new ApiError({
      message: responseData.message,
      code: responseData.code,
      data: responseData.data,
    });
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
    };
  }
}
