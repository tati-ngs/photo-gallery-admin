import { NextResponse } from "next/server";
import {
  adminAccessTokenCookie,
  adminRefreshTokenCookie,
  createSupabaseAuthClient,
  isSupabaseAuthConfigured,
} from "@/lib/adminAuth";

const defaultRedirectPath = "/dashboard";

const getSafeRedirectPath = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return defaultRedirectPath;
  }

  if (value.startsWith("//") || value.startsWith("/login")) {
    return defaultRedirectPath;
  }

  return value;
};

const setSessionCookies = (
  response: NextResponse,
  session: { access_token: string; expires_in: number; refresh_token: string },
) => {
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
};

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: "La connexion Supabase n’est pas configurée." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const supabase = createSupabaseAuthClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const intent = String(formData.get("intent") ?? "login");

  if (!supabase) {
    return NextResponse.json(
      { error: "La connexion Supabase n’est pas disponible." },
      { status: 500 },
    );
  }

  if (intent === "signup") {
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "Renseignez votre prénom, votre nom et votre numéro de téléphone." },
        { status: 400 },
      );
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, phone, role: "photographer" },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ redirect: "/login?created=1" });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message ?? "Connexion impossible pour le moment." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    redirect: getSafeRedirectPath(formData.get("next")),
  });
  setSessionCookies(response, data.session);
  return response;
}
