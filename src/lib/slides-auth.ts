import { createHash, timingSafeEqual } from "node:crypto";

export const SLIDES_PASSWORD_ENV_NAME = "SLIDES_PASSWORD";
export const SLIDES_AUTH_COOKIE_NAME = "slides_auth";

function getConfiguredSlidesPassword(): string | null {
  const configuredPassword = process.env[SLIDES_PASSWORD_ENV_NAME];
  if (!configuredPassword) {
    return null;
  }
  return configuredPassword.trim();
}

export function hasSlidesPasswordConfigured(): boolean {
  return Boolean(getConfiguredSlidesPassword());
}

export function isSlidesPasswordValid(password: string): boolean {
  const configuredPassword = getConfiguredSlidesPassword();
  if (!configuredPassword) {
    return false;
  }

  const configuredPasswordBuffer = Buffer.from(configuredPassword);
  const passwordBuffer = Buffer.from(password);
  if (configuredPasswordBuffer.length !== passwordBuffer.length) {
    return false;
  }

  return timingSafeEqual(configuredPasswordBuffer, passwordBuffer);
}

export function getSlidesAuthCookieValue(): string | null {
  const configuredPassword = getConfiguredSlidesPassword();
  if (!configuredPassword) {
    return null;
  }
  return createHash("sha256").update(`slides:${configuredPassword}`).digest("hex");
}

export function isSlidesAuthCookieValid(cookieValue: string | undefined): boolean {
  const expectedCookieValue = getSlidesAuthCookieValue();
  if (!cookieValue || !expectedCookieValue) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedCookieValue);
  const receivedBuffer = Buffer.from(cookieValue);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}
