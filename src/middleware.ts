import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, getAccessPassword, isValidAuthToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  if (!getAccessPassword()) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (isValidAuthToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
