import { NextResponse, type NextRequest } from "next/server";
import { adminAccessTokenCookie, isAccessTokenValid } from "./lib/adminAuth";

const publicPathPrefixes = [
  "/_next",
  "/favicon.ico",
  "/login",
  "/logout",
];

const isPublicPath = (pathname: string) =>
  publicPathPrefixes.some((prefix) => pathname.startsWith(prefix));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const currentSession = request.cookies.get(adminAccessTokenCookie)?.value;

  if (isAccessTokenValid(currentSession)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};

