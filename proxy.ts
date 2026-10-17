import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  adminAccessTokenCookie,
  adminRefreshTokenCookie,
  getSupabaseAuthConfig,
  isAccessTokenValid,
} from "./lib/adminAuth";

const publicPathPrefixes = [
  "/_next",
  "/favicon.ico",
  "/login",
  "/logout",
];

const isPublicPath = (pathname: string) =>
  publicPathPrefixes.some((prefix) => pathname.startsWith(prefix));

const refreshAdminSession = async (request: NextRequest) => {
  const refreshToken = request.cookies.get(adminRefreshTokenCookie)?.value;
  const { anonKey, url } = getSupabaseAuthConfig();

  if (!refreshToken || !anonKey || !url) {
    return null;
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    return null;
  }

  // Make the renewed token available to the page rendered by this request.
  request.cookies.set(adminAccessTokenCookie, data.session.access_token);
  request.cookies.set(adminRefreshTokenCookie, data.session.refresh_token);

  const response = NextResponse.next({ request });
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(adminAccessTokenCookie, data.session.access_token, {
    httpOnly: true,
    maxAge: data.session.expires_in,
    path: "/",
    sameSite: "lax",
    secure,
  });
  response.cookies.set(adminRefreshTokenCookie, data.session.refresh_token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure,
  });

  return response;
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const currentSession = request.cookies.get(adminAccessTokenCookie)?.value;

  if (isAccessTokenValid(currentSession)) {
    return NextResponse.next();
  }

  const refreshedResponse = await refreshAdminSession(request);

  if (refreshedResponse) {
    return refreshedResponse;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\.).*)"],
};

