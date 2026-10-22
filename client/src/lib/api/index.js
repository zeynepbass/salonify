import { ApiClient } from "@/lib/api/ApiClient";

export const api = ApiClient.getInstance();

export { getErrorMessage, getResponseMessage, isNotFound, toApiError } from "@/lib/api/errors";
