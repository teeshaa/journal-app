import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SlidesLogin } from "@/components/slides/slides-login";
import { Presentation } from "@/components/slides/presentation";
import {
  hasSlidesPasswordConfigured,
  isSlidesAuthCookieValid,
  SLIDES_AUTH_COOKIE_NAME,
  SLIDES_PASSWORD_ENV_NAME,
} from "@/lib/slides-auth";

export const metadata: Metadata = {
  title: "Presentation Slides",
  description: "Password-protected slide deck",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SlidesPage() {
  if (!hasSlidesPasswordConfigured()) {
    return (
      <section className="slides-config-missing">
        <div className="slides-config-card">
          <h1 className="slides-config-title">Slides password is missing</h1>
          <p className="slides-config-subtitle">
            Set <code>{SLIDES_PASSWORD_ENV_NAME}</code> in your environment and redeploy.
          </p>
        </div>
      </section>
    );
  }

  const cookieStore = await cookies();
  const isAuthorized = isSlidesAuthCookieValid(
    cookieStore.get(SLIDES_AUTH_COOKIE_NAME)?.value,
  );

  if (!isAuthorized) {
    return <SlidesLogin />;
  }

  return <Presentation />;
}
