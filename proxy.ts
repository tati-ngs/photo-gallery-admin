import { NextResponse, type NextRequest } from "next/server";
import { createClient, type Session } from "@supabase/supabase-js";
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
  "/api/auth/login",
  "/logout",
];

const isPublicPath = (pathname: string) =>
  publicPathPrefixes.some((prefix) => pathname.startsWith(prefix));

const inFlightRefreshes = new Map<string, Promise<Session | null>>();

const refreshAdminSession = (refreshToken: string) => {
  const existingRefresh = inFlightRefreshes.get(refreshToken);
  if (existingRefresh) return existingRefresh;

  const { anonKey, url } = getSupabaseAuthConfig();

  if (!anonKey || !url) {
    return Promise.resolve(null);
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const refreshPromise = supabase.auth
    .refreshSession({ refresh_token: refreshToken })
    .then(({ data, error }) => (error || !data.session ? null : data.session))
    .catch(() => null)
    .finally(() => {
      setTimeout(() => inFlightRefreshes.delete(refreshToken), 15_000);
    });

  inFlightRefreshes.set(refreshToken, refreshPromise);
  return refreshPromise;
};

const denyRequest = (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const currentSession = request.cookies.get(adminAccessTokenCookie)?.value;
  const currentRefreshToken = request.cookies.get(adminRefreshTokenCookie)?.value;

  const { anonKey, url } = getSupabaseAuthConfig();

  // A valid JWT is enough for the request; the network check below is only
  // needed when the token has expired or cannot be decoded locally.
  if (isAccessTokenValid(currentSession)) {
    return NextResponse.next({ request });
  }

  if (currentSession && anonKey && url) {
    const supabase = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    const { data, error } = await supabase.auth.getUser(currentSession);

    if (data.user && !error) {
      return NextResponse.next({ request });
    }
  }

  if (currentRefreshToken) {
    const session = await refreshAdminSession(currentRefreshToken);

    if (session) {
      request.cookies.set(adminAccessTokenCookie, session.access_token);
      request.cookies.set(adminRefreshTokenCookie, session.refresh_token);

      const response = NextResponse.next({ request });
      const secure = process.env.NODE_ENV === "production";
      response.cookies.set(adminAccessTokenCookie, session.access_token, {
        httpOnly: true,
        maxAge: session.expires_in,
        path: "/",
        sameSite: "lax",
        secure,
      });
      response.cookies.set(adminRefreshTokenCookie, session.refresh_token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
        secure,
      });
      return response;
    }
  }

  return denyRequest(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

