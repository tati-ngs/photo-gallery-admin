import { cookies } from "next/headers";
import {
  adminAccessTokenCookie,
  getUserIdFromAccessToken,
} from "@/lib/adminAuth";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(adminAccessTokenCookie)?.value ?? "";
  const photographerId = getUserIdFromAccessToken(accessToken);
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data } = await supabase
    .from("photographer_profiles")
    .select("display_name, slug, whatsapp, email")
    .eq("id", photographerId)
    .maybeSingle();

  return (
    <SettingsClient
      accessToken={accessToken}
      photographerId={photographerId}
      initialProfile={data ?? null}
    />
  );
}
