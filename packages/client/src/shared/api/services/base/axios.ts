// import { axiosInstance } from "~/shared/config/axios";
// import type { RequestResponse } from "./types";
// import type { AxiosRequestConfig } from "axios";
// import axios from "axios";
// import { ApiError } from "~/shared/config/error";

// export class AxiosService {
//   async get<TData = unknown, TError = unknown, TConfig = unknown>(
//     url: string,
//     config: AxiosRequestConfig<TConfig>
//   ) {
//     try {
//       const response = await axiosInstance.get<RequestResponse<TData, TError>>(
//         url,
//         config
//       );

//       if (!response.data.success) {
//         throw new Error(response.data.message || "Request failed");
//       }

//       return {
//         success: true,
//         data: response.data.data,
//         message: response.data.message,
//         originalResponse: response,
//       };
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         throw ApiError.fromResponse({
//           message: error.response?.data?.message,
//           code: error.response?.status,
//         });
//       }

//       if (error instanceof Error) {
//         throw ApiError.fromResponse({
//           message: error.message,
//           code: -100,
//         });
//       }

//       throw ApiError.fromResponse({
//         message: "Unknown error",
//         code: -200,
//       });
//     }
//   }
// }
