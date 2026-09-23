import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

let isRefreshing = false;

let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const noRefreshRoutes = [
  "/api/auth/signup",
  "/api/auth/login",
  "/api/auth/google",
  "/api/auth/google/callback",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/logout-all",
];

const processQueue = (error?: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  failedQueue = [];
};

export const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isNoRefreshRoute = noRefreshRoutes.includes(
      originalRequest.url ?? ""
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRefreshRoute
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosInstance(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        await axiosInstance.post("/api/auth/refresh");

        processQueue();

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);