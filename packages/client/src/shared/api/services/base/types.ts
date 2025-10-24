export interface BaseResponse<TOriginalResponse = unknown> {
  success: boolean;
  message?: string;
  originalResponse?: TOriginalResponse;
}

export interface SuccessResponse<TData = unknown, TOriginalResponse = unknown>
  extends BaseResponse<TOriginalResponse> {
  success: true;
  data: TData;
}

export interface ErrorResponse<TError = unknown, TOriginalResponse = unknown>
  extends BaseResponse<TOriginalResponse> {
  success: false;
  data?: TError | null;
  message: string;
  type?: string;
}

export type RequestResponse<
  TData = unknown,
  TError = unknown,
  TOriginalResponse = unknown
> =
  | SuccessResponse<TData, TOriginalResponse>
  | ErrorResponse<TError, TOriginalResponse>;
