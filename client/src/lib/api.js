import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

let accessToken = null;
let refreshing = null;

export function setAccessToken(token) {
  accessToken = token;
}

export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export function refreshSession() {
  refreshing ??= axios
    .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
    .then((response) => {
      const session = response.data.data;
      setAccessToken(session.accessToken);
      return session;
    })
    .catch((error) => {
      setAccessToken(null);
      throw error;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
}

api.interceptors.response.use(
  (response) => response.data.data,
  async (error) => {
    const request = error.config;
    const canRetry = error.response?.status === 401 && request && !request.retried && !request.url.startsWith("/auth/");

    if (canRetry) {
      request.retried = true;
      try {
        await refreshSession();
        return api(request);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = "Bir şeyler ters gitti. Lütfen tekrar deneyin.") {
  return error?.response?.data?.message ?? fallback;
}

export function isNotFound(error) {
  return error?.response?.status === 404 || error?.response?.status === 400;
}

export function uploadImage(file) {
  const body = new FormData();
  body.append("file", file);
  return api.post("/uploads", body);
}
