import { describe, expect, it } from "vitest";
import { getErrorMessage, getResponseMessage, isNotFound, toApiError } from "@/lib/api/errors";

const httpError = (status, data) => ({ isAxiosError: true, response: { status, data } });

describe("toApiError", () => {
  it("sunucu mesajını ve alan hatalarını okur", () => {
    const error = httpError(400, {
      message: "E-posta geçersiz.",
      errors: [{ field: "email", message: "E-posta geçersiz." }, { field: "name", message: "Ad gerekli." }, null],
    });
    expect(toApiError(error)).toEqual({
      status: 400,
      message: "E-posta geçersiz.",
      fieldErrors: [
        { field: "email", message: "E-posta geçersiz." },
        { field: "name", message: "Ad gerekli." },
      ],
    });
  });

  it("ağ hatasında bağlantı mesajı verir", () => {
    const error = { isAxiosError: true, code: "ERR_NETWORK", message: "Network Error" };
    expect(toApiError(error).status).toBe(0);
    expect(getErrorMessage(error)).toMatch(/Sunucuya ulaşılamadı/);
  });

  it("zaman aşımını ayırt eder", () => {
    expect(getErrorMessage({ isAxiosError: true, code: "ECONNABORTED" })).toMatch(/zamanında yanıt vermedi/);
  });

  it("gövdesi HTML ya da boş olan yanıtta varsayılan mesajı kullanır", () => {
    expect(getErrorMessage(httpError(502, "<html>Bad Gateway</html>"))).toBe("Bir şeyler ters gitti. Lütfen tekrar deneyin.");
    expect(getErrorMessage(httpError(500, { message: "   " }), "Özel mesaj")).toBe("Özel mesaj");
    expect(toApiError(httpError(500, null)).fieldErrors).toEqual([]);
  });

  it("undefined hata için çökmeden varsayılan döner", () => {
    expect(toApiError(undefined).message).toBe("Bir şeyler ters gitti. Lütfen tekrar deneyin.");
  });
});

describe("isNotFound", () => {
  it("404 ve geçersiz kimlik (400) durumlarını bulunamadı sayar", () => {
    expect(isNotFound(httpError(404, {}))).toBe(true);
    expect(isNotFound(httpError(400, {}))).toBe(true);
    expect(isNotFound(httpError(500, {}))).toBe(false);
    expect(isNotFound(null)).toBe(false);
  });
});

describe("getResponseMessage", () => {
  it("yanıttaki mesajı ya da yedeğini döner", () => {
    expect(getResponseMessage({ message: "Hizmet silindi." }, "x")).toBe("Hizmet silindi.");
    expect(getResponseMessage(undefined, "Yedek")).toBe("Yedek");
    expect(getResponseMessage({ message: "" }, "Yedek")).toBe("Yedek");
  });
});
