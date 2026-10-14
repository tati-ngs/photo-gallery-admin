import { cookies } from "next/headers";
import { statusClasses } from "@/data/galleries";
import {
  adminAccessTokenCookie,
  getUserIdFromAccessToken,
} from "@/lib/adminAuth";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase";
import ClientsClient, { type ClientGallery } from "./ClientsClient";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(adminAccessTokenCookie)?.value ?? "";
  const photographerId = getUserIdFromAccessToken(accessToken);
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { data } = await supabase
    .from("galleries")
    .select("id, client, contact, code, type, date, photos, status, created_at")
    .eq("photographer_id", photographerId)
    .order("created_at", { ascending: false });

  return (
    <ClientsClient
      galleries={(data as ClientGallery[] | null) ?? []}
      statusClasses={statusClasses}
    />
  );
}
