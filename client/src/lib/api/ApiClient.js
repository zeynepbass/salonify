import axios from "axios";

const DEFAULT_BASE_URL = "http://localhost:5000/api";
const AUTH_PREFIX = "/auth/";

export class ApiClient {
  static #instance = null;

  #accessToken = null;
  #refreshing = null;

  static getInstance() {
    ApiClient.#instance ??= new ApiClient(process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL);
    return ApiClient.#instance;
  }

  constructor(baseURL) {
    if (ApiClient.#instance) throw new Error("ApiClient tekil bir nesnedir; ApiClient.getInstance() kullanın.");

    this.baseURL = baseURL;
    this.http = axios.create({ baseURL, withCredentials: true });
    this.http.interceptors.request.use((config) => this.#attachToken(config));
    this.http.interceptors.response.use(
      (response) => response.data.data,
      (error) => this.#retryWithFreshToken(error),
    );
  }

  setAccessToken(token) {
    this.#accessToken = token ?? null;
  }

  refreshSession() {
    this.#refreshing ??= axios
      .post(`${this.baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((response) => {
        const session = response.data.data;
        this.setAccessToken(session.accessToken);
        return session;
      })
      .catch((error) => {
        this.setAccessToken(null);
        throw error;
      })
      .finally(() => {
        this.#refreshing = null;
      });

    return this.#refreshing;
  }

  get(url, config) {
    return this.http.get(url, config);
  }

  post(url, body, config) {
    return this.http.post(url, body, config);
  }

  patch(url, body, config) {
    return this.http.patch(url, body, config);
  }

  delete(url, config) {
    return this.http.delete(url, config);
  }

  uploadImage(file) {
    const body = new FormData();
    body.append("file", file);
    return this.post("/uploads", body);
  }

  #attachToken(config) {
    if (this.#accessToken) config.headers.Authorization = `Bearer ${this.#accessToken}`;
    return config;
  }

  async #retryWithFreshToken(error) {
    const request = error.config;
    const canRetry =
      error.response?.status === 401 && request && !request.retried && !request.url.startsWith(AUTH_PREFIX);

    if (!canRetry) throw error;

    request.retried = true;
    try {
      await this.refreshSession();
    } catch {
      throw error;
    }
    return this.http(request);
  }
}
