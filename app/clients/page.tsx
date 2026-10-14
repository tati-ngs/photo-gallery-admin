import { statusClasses } from "@/data/galleries";
import { supabase } from "@/lib/supabase";
import ClientsClient, { type ClientGallery } from "./ClientsClient";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { data } = await supabase
    .from("galleries")
    .select("client, code, type, date, photos, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <ClientsClient
      galleries={(data as ClientGallery[] | null) ?? []}
      statusClasses={statusClasses}
    />
  );
}
