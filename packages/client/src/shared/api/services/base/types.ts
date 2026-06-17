export interface BaseResponse<TOriginalResponse = unknown> {
  success: boolean;
  message?: string;
  originalResponse?: TOriginalResponse;
}

export interface SuccessResponse<
  TData = unknown,
  TOriginalResponse = unknown,
> extends BaseResponse<TOriginalResponse> {
  success: true;
  data: TData;
}

export type ApiErrorCode =
  | "CODE_NOT_FOUND"
  | "EMAIL_ALREADY_EXISTS"
  | "EMAIL_DAILY_LIMIT"
  | "INVALID_CODE"
  | "INVALID_CURRENT_PASSWORD"
  | "NEED_PASSWORD_BEFORE_UNLINK"
  | "PASSWORD_ALREADY_SET"
  | "PASSWORD_NOT_SET"
  | "PROVIDER_ALREADY_CONNECTED"
  | "PROVIDER_NOT_LINKED"
  | "PROVIDER_NOT_SUPPORTED"
  | "RESEND_TOO_EARLY"
  | "RESET_TOKEN_INVALID"
  | "SAME_PASSWORD"
  | "TOO_MANY_ATTEMPTS"
  | "USER_NOT_FOUND"
  | "YANDEX_ALREADY_LINKED";

export interface ErrorResponse<
  TError = unknown,
  TOriginalResponse = unknown,
> extends BaseResponse<TOriginalResponse> {
  success: false;
  data?: TError | null;
  message: ApiErrorCode | (string & {});
  type?: string;
}

export type RequestResponse<
  TData = unknown,
  TError = unknown,
  TOriginalResponse = unknown,
> =
  | SuccessResponse<TData, TOriginalResponse>
  | ErrorResponse<TError, TOriginalResponse>;
