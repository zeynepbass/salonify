import { describe, expect, it } from "vitest";
import { api } from "@/lib/api";
import { ApiClient } from "@/lib/api/ApiClient";

describe("ApiClient", () => {
  it("her çağrıda aynı örneği döner", () => {
    expect(ApiClient.getInstance()).toBe(ApiClient.getInstance());
    expect(api).toBe(ApiClient.getInstance());
  });

  it("ikinci bir örnek oluşturulmasına izin vermez", () => {
    expect(() => new ApiClient("http://localhost")).toThrow(/tekil/);
  });

  it("token'ı ayarlar ve temizler", () => {
    api.setAccessToken("abc");
    expect(api.accessToken).toBe("abc");
    api.setAccessToken(undefined);
    expect(api.accessToken).toBeNull();
  });

  it("token varken isteğe Authorization başlığı ekler", async () => {
    api.setAccessToken("token-1");
    const [handler] = api.http.interceptors.request.handlers;
    const config = await handler.fulfilled({ headers: {} });
    expect(config.headers.Authorization).toBe("Bearer token-1");
    api.setAccessToken(null);
    const anonymous = await handler.fulfilled({ headers: {} });
    expect(anonymous.headers.Authorization).toBeUndefined();
  });

  it("auth uçlarında 401 aldığında tekrar denemez", async () => {
    const [responseHandler] = api.http.interceptors.response.handlers;
    const error = { config: { url: "/auth/login" }, response: { status: 401 } };
    await expect(responseHandler.rejected(error)).rejects.toBe(error);
  });
});
