import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig;

    if (
  error.response?.status === 401 &&
  !originalRequest._retry &&
  originalRequest.url !== "/api/auth/refresh" &&
  originalRequest.url !== "/api/auth/logout"
) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post("/api/auth/refresh");

        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
  console.log("REFRESH FAILED:", refreshError.response?.status);
  return Promise.reject(refreshError);
}
    }

    return Promise.reject(error);
  }
);