export interface BaseResponse {
  success: boolean;
  message?: string;
}

export interface SuccessResponse<TData = unknown> extends BaseResponse {
  success: true;
  data: TData;
}

export type ErrorResponse<TError = unknown> = {
  success: false;
  data?: TError | null;
  message: string;
  type?: string;
};

export type RequestResponse<TData = unknown, TError = unknown> =
  | SuccessResponse<TData>
  | ErrorResponse<TError>;
