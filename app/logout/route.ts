import { NextResponse } from "next/server";
import {
  adminAccessTokenCookie,
  adminRefreshTokenCookie,
} from "@/lib/adminAuth";

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(adminAccessTokenCookie);
  response.cookies.delete(adminRefreshTokenCookie);

  return response;
}

