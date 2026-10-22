export const MIN_PASSWORD_LENGTH = 8;

const PHONE_PATTERN = /^[0-9+()\s-]{10,20}$/;

export function isValidPhone(value) {
  return PHONE_PATTERN.test(String(value ?? "").trim());
}
