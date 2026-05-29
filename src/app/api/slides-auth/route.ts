import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getSlidesAuthCookieValue,
  hasSlidesPasswordConfigured,
  isSlidesPasswordValid,
  SLIDES_AUTH_COOKIE_NAME,
} from "@/lib/slides-auth";

type SlidesAuthRequestBody = {
  password?: unknown;
};

export async function POST(request: Request) {
  if (!hasSlidesPasswordConfigured()) {
    return NextResponse.json(
      { error: "Slides password is not configured on the server." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as SlidesAuthRequestBody;
    if (typeof body.password === "string") {
      password = body.password;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isSlidesPasswordValid(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const cookieValue = getSlidesAuthCookieValue();
  if (!cookieValue) {
    return NextResponse.json(
      { error: "Slides password is not configured on the server." },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: SLIDES_AUTH_COOKIE_NAME,
    value: cookieValue,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/slides",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
