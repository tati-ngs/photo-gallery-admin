export type GalleryStatus = "Brouillon" | "Prête" | "Livrée";

export type Gallery = {
  client: string;
  code: string;
  type: string;
  date: string;
  photos: number | string;
  status: GalleryStatus;
};

export const galleries: Gallery[] = [];

export const statusClasses: Record<GalleryStatus, string> = {
  Brouillon: "bg-[#fff3d6] text-[#8a5a00]",
  Livrée: "bg-[#e8fbef] text-[#197a3b]",
  Prête: "bg-[#f1e9ff] text-[#6f3de2]",
};
