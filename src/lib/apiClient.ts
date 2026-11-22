import { ofetch } from "ofetch";

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

const apiClient = ofetch.create({
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

export default apiClient;
