import { cookies } from "next/headers";
import {
  adminAccessTokenCookie,
  getUserIdFromAccessToken,
} from "@/lib/adminAuth";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase";
import GalleryDetailClient, { type GalleryDetails } from "./GalleryDetailClient";

export const dynamic = "force-dynamic";

const emptyGalleryDetails: GalleryDetails = {
  client: "Galerie introuvable",
  contact: "",
  photographer_message: "",
  code: "",
  type: "Non renseigné",
  date: "Non renseignée",
  status: "Brouillon",
  photos: 0,
};

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(adminAccessTokenCookie)?.value ?? "";
  const photographerId = getUserIdFromAccessToken(accessToken);
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const { code } = await params;
  const { data } = await supabase
    .from("galleries")
    .select("client, contact, photographer_message, code, type, date, status, photos")
    .eq("code", code)
    .eq("photographer_id", photographerId)
    .maybeSingle();

  return (
    <GalleryDetailClient
      accessToken={accessToken}
      code={code}
      initialGallery={(data as GalleryDetails | null) ?? emptyGalleryDetails}
      photographerId={photographerId}
    />
  );
}
