import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import type { ApiResponse } from "./api";

const ACCESS_TOKEN = "access_token"

const api: AxiosInstance = axios.create({
  baseURL: "https://parrot-backend-7nik.onrender.com",
//   withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (config.data instanceof FormData) {
    } else if (config.data && typeof config.data === "object") {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const errorMessage =
      (error.response?.data as any)?.message ||
      error.message ||
      "An error occurred";
    return Promise.reject(new Error(errorMessage));
  },
);

const apiClient = {
  get: <T>(url: string) =>
    api.get<ApiResponse<T>>(url).then((response) => response.data),

  post: <T>(url: string, data?: unknown) =>
    api.post<ApiResponse<T>>(url, data).then((response) => response.data),

  patch: <T>(url: string, data?: unknown) =>
    api.patch<ApiResponse<T>>(url, data).then((response) => response.data),

  put: <T>(url: string, data?: unknown) =>
    api.put<ApiResponse<T>>(url, data).then((response) => response.data),

  delete: <T>(url: string) =>
    api.delete<ApiResponse<T>>(url).then((response) => response.data),
};

export { apiClient as api };
