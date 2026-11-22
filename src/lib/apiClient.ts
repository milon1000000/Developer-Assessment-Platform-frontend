import { ofetch, type FetchOptions } from "ofetch";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export const setAuthToken = (token: string | null) => {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

// Base client for standard requests
const baseClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  headers: {
    Accept: "application/json",
  },
  onRequest({ options }) {
    const token = getAuthToken();
    if (token) {
      const headers = new Headers(options.headers);
      headers.set("Authorization", `Bearer ${token}`);
      options.headers = headers;
    }
  },
});

// Mutex / promise lock for handling concurrent 401 refresh requests
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      // Use raw ofetch directly to avoid recursive loop on 401
      const res = await ofetch<{
        statusCode: number;
        success: boolean;
        message: string;
        data?: { accessToken: string; refreshToken?: string };
      }>("/auth/refresh-token", {
        baseURL: BASE_URL,
        method: "POST",
        credentials: "include",
      });

      const newAccessToken = res?.data?.accessToken;
      if (newAccessToken) {
        setAuthToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch {
      setAuthToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Wrapper apiClient with silent token refresh on 401
const apiClient = async <T = unknown>(
  request: string,
  options?: FetchOptions,
): Promise<T> => {
  try {
    return (await baseClient(request, options)) as T;
  } catch (err: unknown) {
    const errorObj = err as { status?: number };
    const isAuthEndpoint =
      typeof request === "string" &&
      (request.includes("/auth/login") ||
        request.includes("/auth/logout") ||
        request.includes("/auth/refresh-token") ||
        request.includes("/auth/register") ||
        request.includes("/auth/google"));

    // If 401 Unauthorized occurs on an authenticated resource, attempt silent refresh
    if (errorObj?.status === 401 && !isAuthEndpoint) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the original request with the renewed accessToken
        const retryOptions = { ...options };
        const headers = new Headers(retryOptions.headers);
        headers.set("Authorization", `Bearer ${newToken}`);
        retryOptions.headers = headers;

        return (await baseClient(request, retryOptions)) as T;
      }

      // If refresh token is expired or invalid, redirect to login from protected views
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const isAuthPage =
          path === "/" ||
          path === "/login" ||
          path === "/register" ||
          path === "/forgot-password" ||
          path === "/reset-password" ||
          path === "/account-verify" ||
          path.startsWith("/auth/");

        if (!isAuthPage) {
          window.location.href = `/login?error=${encodeURIComponent(
            "Session expired. Please log in again.",
          )}`;
        }
      }
    }

    throw err;
  }
};

export default apiClient;
