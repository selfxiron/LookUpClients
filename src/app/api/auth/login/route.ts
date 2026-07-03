import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  createAuthToken,
  getAccessPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const configuredPassword = getAccessPassword();

  if (!configuredPassword) {
    return NextResponse.json({ success: true });
  }

  try {
    const body = (await request.json()) as { password?: string };

    if (body.password !== configuredPassword) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, await createAuthToken(configuredPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
