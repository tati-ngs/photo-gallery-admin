import { cookies } from "next/headers";
import {
  adminAccessTokenCookie,
  getUserIdFromAccessToken,
} from "@/lib/adminAuth";
import { PhotosClient } from "./PhotosClient";

export default async function PhotosPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(adminAccessTokenCookie)?.value ?? "";
  const photographerId = getUserIdFromAccessToken(accessToken);

  return (
    <PhotosClient
      accessToken={accessToken}
      photographerId={photographerId}
    />
  );
}
