"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminAccessTokenCookie,
  adminRefreshTokenCookie,
  createSupabaseAuthClient,
  isSupabaseAuthConfigured,
} from "@/lib/adminAuth";

export type LoginState = {
  error: string;
  success: string;
};

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

const setSessionCookies = async (session: {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}) => {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(adminAccessTokenCookie, session.access_token, {
    httpOnly: true,
    maxAge: session.expires_in,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });
  cookieStore.set(adminRefreshTokenCookie, session.refresh_token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseAuthConfigured()) {
    return {
      error:
        "Ajoutez les variables Supabase avant d’activer les comptes photographes.",
      success: "",
    };
  }

  const supabase = createSupabaseAuthClient();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const intent = String(formData.get("intent") ?? "login");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!supabase) {
    return {
      error: "La connexion Supabase n’est pas disponible.",
      success: "",
    };
  }

  if (intent === "signup") {
    if (!firstName || !lastName || !phone) {
      return {
        error: "Renseignez votre prénom, votre nom et votre numéro de téléphone.",
        success: "",
      };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          role: "photographer",
        },
      },
    });

    if (error) {
      return { error: error.message, success: "" };
    }

    redirect("/login?created=1");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return {
      error: error?.message ?? "Connexion impossible pour le moment.",
      success: "",
    };
  }

  await setSessionCookies(data.session);
  redirect(getSafeRedirectPath(formData.get("next")));
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(adminAccessTokenCookie);
  cookieStore.delete(adminRefreshTokenCookie);
  redirect("/login");
}

