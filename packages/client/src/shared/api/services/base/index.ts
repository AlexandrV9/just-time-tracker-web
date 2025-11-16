/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosInstance } from "~/shared/config/axios";
import { AxiosAdapter, type HttpAdapter } from "./adapters";
import type { RequestResponse } from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type RequestConfig = {
  method?: string;
  url?: string;
  data?: any;
  withCredentials?: boolean;
  headers?: Record<string, any>;
  params?: any;
};

export class HttpService {
  private adapter: HttpAdapter;

  constructor(adapter: HttpAdapter) {
    this.adapter = adapter;
  }

  async get<TData = unknown, TError = unknown>(
    url: string,
    config?: Omit<RequestConfig, "data" | "url" | "method">
  ): Promise<RequestResponse<TData, TError>> {
    return this.adapter.request<TData, TError>({
      method: "GET",
      url,
      ...config,
    });
  }

  async post<TData, TError = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "url">
  ): Promise<RequestResponse<TData, TError>> {
    return this.adapter.request({
      method: "POST",
      url,
      ...config,
    });
  }

  async put<TData = unknown, TError = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "url">
  ): Promise<RequestResponse<TData, TError>> {
    return this.adapter.request({
      method: "PUT",
      url,
      ...config,
    });
  }

  async patch<TData = unknown, TError = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "url">
  ): Promise<RequestResponse<TData, TError>> {
    return this.adapter.request({
      method: "PATCH",
      url,
      ...config,
    });
  }

  async delete<TData = unknown, TError = unknown>(
    url: string,
    config?: Omit<RequestConfig, "method" | "url" | "data">
  ): Promise<RequestResponse<TData, TError>> {
    return this.adapter.request({
      method: "DELETE",
      url,
      ...config,
    });
  }
}

export const authApi = new HttpService(new AxiosAdapter());
export const baseApi = new HttpService(new AxiosAdapter(axiosInstance));
