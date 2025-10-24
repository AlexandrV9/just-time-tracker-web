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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// export class FetchAdapter implements HttpAdapter {
//   async request<
//     TData = unknown,
//     TError = unknown,
//     TOriginalResponse = unknown
//   >(config: {
//     method: string;
//     url: string; // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     data?: any;
//   }): Promise<RequestResponse<TData, TError, TOriginalResponse>> {
//     try {
//       const response = await fetch(config.url);
//       const data = await response.json();

//       return {
//         success: true,
//         data: data,
//         originalResponse: response,
//       } satisfies SuccessResponse;
//     } catch {
//       throw {
//         success: false,
//         message: "dd",
//         originalResponse: response,
//       } satisfies ErrorResponse;
//     }
//   }
// }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// export class XMLHttpAdapter implements HttpAdapter {
//   async request<T>(config: RequestConfig): Promise<RequestResponse<T>> {
//     try {
//       return new Promise((resolve) => {
//         const xhr = new XMLHttpRequest();

//         const url = this.buildUrl(config.url, config.params);

//         xhr.open(config.method || "GET", url, true);

//         // Отслеживание прогресса загрузки
//         // if (config.onProgress) {
//         //   xhr.upload.onprogress = (event) => {
//         //     if (event.lengthComputable) {
//         //       const progress = (event.loaded / event.total) * 100;
//         //       config.onProgress!(progress);
//         //     }
//         //   };
//         // }

//         // Установка заголовков
//         // if (config.headers) {
//         //   Object.keys(config.headers).forEach((key) => {
//         //     xhr.setRequestHeader(key, config.headers![key]);
//         //   });
//         // }

//         xhr.onload = () => {
//           try {
//             const responseData = xhr.responseText
//               ? JSON.parse(xhr.responseText)
//               : null;

//             // Успешный ответ (2xx status)
//             if (xhr.status >= 200 && xhr.status < 300) {
//               resolve({
//                 success: true,
//                 data: responseData,
//                 message: xhr.statusText,
//                 originalResponse: xhr,
//               });
//             } else {
//               // Ошибка HTTP
//               resolve({
//                 success: false,
//                 message: responseData?.message || xhr.statusText,
//                 data: responseData,
//                 originalResponse: undefined,
//               });
//             }
//           } catch (parseError: unknown) {
//             // Ошибка парсинга JSON
//             resolve({
//               success: false,
//               message: "Failed to parse response",
//               originalResponse: undefined,
//               // code: xhr.status,
//               // data: null as E,
//             });
//           }
//         };

//         xhr.onerror = () => {
//           resolve({
//             success: false,
//             message: "Network error",
//             originalResponse: undefined,
//             // code: -1,
//             // data: null as E,
//           });
//         };

//         xhr.ontimeout = () => {
//           resolve({
//             success: false,
//             message: "Request timeout",
//             originalResponse: undefined,
//             // code: -2,
//             // data: null as E,
//           });
//         };

//         if (
//           config.data &&
//           ["POST", "PUT", "PATCH"].includes(config.method || "")
//         ) {
//           xhr.send(JSON.stringify(config.data));
//         } else {
//           xhr.send();
//         }
//       });
//     } catch {
//       throw {
//         success: false,
//         message: "dd",
//         originalResponse: undefined,
//       } satisfies ErrorResponse;
//     }
//   }

//   private buildUrl(url: string, params?: Record<string, any>): string {
//     // ... та же реализация
//     return "";
//   }
// }
