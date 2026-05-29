import {
  getSlidesAuthCookieValue,
  hasSlidesPasswordConfigured,
  isSlidesAuthCookieValid,
  isSlidesPasswordValid,
  SLIDES_PASSWORD_ENV_NAME,
} from "@/lib/slides-auth";

describe("slides-auth", () => {
  const originalPassword = process.env[SLIDES_PASSWORD_ENV_NAME];

  afterEach(() => {
    if (originalPassword === undefined) {
      delete process.env[SLIDES_PASSWORD_ENV_NAME];
      return;
    }

    process.env[SLIDES_PASSWORD_ENV_NAME] = originalPassword;
  });

  it("reports when the slides password is not configured", () => {
    delete process.env[SLIDES_PASSWORD_ENV_NAME];
    expect(hasSlidesPasswordConfigured()).toBe(false);
  });

  it("accepts a trimmed configured password", () => {
    process.env[SLIDES_PASSWORD_ENV_NAME] = "  secret-pass  ";
    expect(hasSlidesPasswordConfigured()).toBe(true);
    expect(isSlidesPasswordValid("secret-pass")).toBe(true);
    expect(isSlidesPasswordValid("wrong-pass")).toBe(false);
  });

  it("creates a stable auth cookie value for the configured password", () => {
    process.env[SLIDES_PASSWORD_ENV_NAME] = "secret-pass";
    const cookieValue = getSlidesAuthCookieValue();
    expect(cookieValue).toBeTruthy();
    expect(isSlidesAuthCookieValid(cookieValue ?? undefined)).toBe(true);
    expect(isSlidesAuthCookieValid("invalid-cookie")).toBe(false);
  });
});
