import axios, { AxiosError, AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { useAlertStore } from "@/stores/alert-store";
import { AlertEnum } from "@/models/alert-model";
import { router } from "@/main";
import i18n from "./language/i18n/i18n";

// The POS service listens on port 8090 (set VITE_API_URL to override, e.g. for a reverse proxy).
const API_PORT = 8090;

const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Server-side fallback (SSR / Node, if needed)
  if (typeof window === "undefined") {
    return `http://localhost:${API_PORT}/api`;
  }

  return `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api`;
};

// Axios Instance
const axiosApi: AxiosInstance = axios.create({
  baseURL: getApiUrl(),

  headers: {
    "Content-Type": "application/json",
  },
});

// ==========================================
// REQUEST INTERCEPTOR - Add token to headers
// ==========================================
axiosApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach current language to headers
    if (config.headers) {
      const currentLanguage = i18n.language || "en";
      config.headers["Accept-Language"] = currentLanguage;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ==========================================
// RESPONSE INTERCEPTOR - Handle errors
// ==========================================
axiosApi.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    // 401 UNAUTHORIZED
    // The backend has no refresh-token flow, so a 401 on a protected call means
    // the session is over. A 401 from the login call itself is just a wrong
    // username/password: the useLogin hook shows the server's message.
    if (status === 401 && !url.includes("/auth/login")) {
      handleSessionExpired();
    }

    // 403 FORBIDDEN
    if (status === 403) {
      useAlertStore.getState().showAlert({
        type: AlertEnum.WARNING,
        message:
          "Access Forbidden! You do not have permission to perform this action.",
      });
    }

    // 500 INTERNAL SERVER ERROR
    if (status === 500) {
      useAlertStore.getState().showAlert({
        type: AlertEnum.ERROR,
        message: "Server Error! Please try again later.",
      });
    }

    // NETWORK ERROR (server unreachable)
    if (!error.response) {
      useAlertStore.getState().showAlert({
        type: AlertEnum.ERROR,
        message: "Network Error! Please check your internet connection.",
      });
    }

    return Promise.reject(error);
  },
);

// ==========================================
// HELPER: Handle Session Expired
// ==========================================
function handleSessionExpired() {
  useAuthStore.getState().clearAuth();

  useAlertStore.getState().showAlert({
    type: AlertEnum.WARNING,
    message: "Your session has expired. Please login again.",
    onConfirm: () => {
      const currentPath = window.location.pathname + window.location.search;
      const redirectPath = currentPath !== "/sign-in" ? currentPath : "/";

      router.navigate({
        to: "/sign-in",
        search: { redirect: redirectPath },
      });
    },
  });
}

export default axiosApi;