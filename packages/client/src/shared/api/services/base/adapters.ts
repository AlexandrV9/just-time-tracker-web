import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { RequestResponse } from "./types";
import axios from "axios";
import { ApiError } from "~/shared/config/error";
import type { ErrorField } from "../auth";

export interface HttpAdapter {
  request<TData = unknown, TError = unknown>(config: {
    method: string;
    url: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
  }): Promise<RequestResponse<TData, TError>>;
}

export class AxiosAdapter implements HttpAdapter {
  _axios: AxiosInstance;

  constructor(axiosInstance: AxiosInstance = axios) {
    this._axios = axiosInstance;
  }

  async request<TData, TError>(
    config: AxiosRequestConfig<TData>
  ): Promise<
    RequestResponse<
      TData,
      TError,
      AxiosResponse<RequestResponse<TData, TError>>
    >
  > {
    try {
      const axiosResponse = await this._axios.request<
        RequestResponse<TData, TError>
      >(config);

      const data = axiosResponse.data;

      if (!data.success) {
        return {
          success: false,
          data: data.data,
          message: data.message,
          originalResponse: axiosResponse,
        };
      }

      return {
        success: true,
        data: data.data,
        originalResponse: axiosResponse,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw ApiError.fromResponse<ErrorField[] | null>({
          message: error.response?.data?.message,
          code: error.response?.status,
          data: error.response?.data?.data || [],
        });
      }

      if (error instanceof ApiError) {
        throw error as ApiError<ErrorField[] | null>;
      }

      console.log("AxiosAdapter: unknown error", error);
      throw ApiError.fromResponse<null>({
        message: "Unknown error",
      });
    }
  }
}

export function unwrap<TData>(response: RequestResponse<TData>): TData {
  if (!response.success) {
    throw ApiError.fromResponse({ message: response.message ?? "Request failed", data: response.data });
  }
  return response.data;
}

export async function noThrowRequest<TData = unknown, TError = unknown>(
  request: Promise<RequestResponse<TData, TError>>
): Promise<RequestResponse<TData, TError>> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        data: error.data,
      };
    }

    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.message,
        data: error.response?.data,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        data: null,
        originalResponse: undefined,
      };
    }

    return {
      success: false,
      message: "Unknown error",
      data: null,
      originalResponse: undefined,
    };
  }
}
