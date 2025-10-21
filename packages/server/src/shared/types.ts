export type ErrorResponse<TData = null> = {
  success: false;
  data?: TData;
  message: string;
};

export type SuccessResponse<TData> = {
  success: true;
  data: TData;
  message?: string;
};
