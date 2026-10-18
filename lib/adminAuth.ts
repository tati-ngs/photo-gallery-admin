import { createClient } from "@supabase/supabase-js";

export const adminAccessTokenCookie = "ps23_admin_access_token";
export const adminRefreshTokenCookie = "ps23_admin_refresh_token";

export const getSupabaseAuthConfig = () => ({
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

export const isSupabaseAuthConfigured = () => {
  const { anonKey, url } = getSupabaseAuthConfig();

  return Boolean(anonKey && url);
};

export const createSupabaseAuthClient = () => {
  const { anonKey, url } = getSupabaseAuthConfig();

  if (!anonKey || !url) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

const decodeBase64Url = (value: string) => {
  const base64 = value.trim().replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  return atob(`${base64}${padding}`);
};

export const isAccessTokenValid = (token?: string) => {
  if (!token) {
    return false;
  }

  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3 || !parts[1]) {
      return false;
    }

    const [, payload] = parts;
    const parsedPayload = JSON.parse(decodeBase64Url(payload)) as {
      exp?: number;
      sub?: string;
    };

    if (!parsedPayload.exp || !parsedPayload.sub) {
      return false;
    }

    return Number(parsedPayload.exp) * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserIdFromAccessToken = (token?: string) => {
  if (!token) {
    return "";
  }

  try {
    const [, payload] = token.split(".");
    const parsedPayload = JSON.parse(decodeBase64Url(payload)) as {
      sub?: string;
    };

    return parsedPayload.sub ?? "";
  } catch {
    return "";
  }
};

