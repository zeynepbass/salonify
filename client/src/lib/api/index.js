import { ApiClient } from "@/lib/api/ApiClient";

export const api = ApiClient.getInstance();

export { getErrorMessage, getFieldErrors, getResponseMessage, isNotFound, toApiError } from "@/lib/api/errors";
