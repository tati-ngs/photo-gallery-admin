import { cookies } from "next/headers";
import {
  adminAccessTokenCookie,
  getUserIdFromAccessToken,
} from "@/lib/adminAuth";
import GaleriesClient from "./GaleriesClient";

export default async function GalleriesPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(adminAccessTokenCookie)?.value ?? "";
  const photographerId = getUserIdFromAccessToken(accessToken);

  return (
    <GaleriesClient
      accessToken={accessToken}
      photographerId={photographerId}
    />
  );
}
