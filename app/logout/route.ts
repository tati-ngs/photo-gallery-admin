import { NextResponse } from "next/server";
import {
  adminAccessTokenCookie,
  adminRefreshTokenCookie,
} from "@/lib/adminAuth";

function logoutResponse(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const cookieOptions = {
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  };

  response.cookies.set(adminAccessTokenCookie, "", cookieOptions);
  response.cookies.set(adminRefreshTokenCookie, "", cookieOptions);

  return response;
}

export function POST(request: Request) {
  return logoutResponse(request);
}

