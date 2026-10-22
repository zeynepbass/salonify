const FALLBACK_MESSAGE = "Bir şeyler ters gitti. Lütfen tekrar deneyin.";
const NETWORK_MESSAGE = "Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.";
const TIMEOUT_MESSAGE = "Sunucu zamanında yanıt vermedi. Lütfen tekrar dene.";

export function toApiError(error) {
  const response = error?.response;

  if (!response) {
    const timedOut = error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT";
    const offline = error?.isAxiosError || error?.code === "ERR_NETWORK";
    return {
      status: 0,
      message: timedOut ? TIMEOUT_MESSAGE : offline ? NETWORK_MESSAGE : error?.message || FALLBACK_MESSAGE,
      fieldErrors: [],
    };
  }

  const body = response.data && typeof response.data === "object" ? response.data : {};
  const fieldErrors = Array.isArray(body.errors)
    ? body.errors.filter((item) => item && typeof item.message === "string")
    : [];

  return {
    status: response.status,
    message: typeof body.message === "string" && body.message.trim() ? body.message : FALLBACK_MESSAGE,
    fieldErrors,
  };
}

export function getErrorMessage(error, fallback = FALLBACK_MESSAGE) {
  const { status, message } = toApiError(error);
  return status === 0 || message !== FALLBACK_MESSAGE ? message : fallback;
}

export function isNotFound(error) {
  const status = error?.response?.status;
  return status === 404 || status === 400;
}

export function getResponseMessage(data, fallback) {
  return typeof data?.message === "string" && data.message.trim() ? data.message : fallback;
}
