export const galleries = [
  {
    client: "Tatiana N'guessan",
    code: "PS23-TATIANA",
    type: "Shooting & lifestyle",
    date: "10/10/2026",
    photos: "42",
    status: "Prête",
  },
  {
    client: "Famille Kouamé",
    code: "PS23-FAMILLE",
    type: "Cérémonie",
    date: "18/10/2026",
    photos: "118",
    status: "Brouillon",
  },
  {
    client: "Brand Studio",
    code: "PS23-BRAND",
    type: "Marque & entreprise",
    date: "24/10/2026",
    photos: "86",
    status: "Livrée",
  },
];

export const statusClasses: Record<string, string> = {
  Brouillon: "bg-[#fff3d6] text-[#8a5a00]",
  Livrée: "bg-[#e8fbef] text-[#197a3b]",
  Prête: "bg-[#f1e9ff] text-[#6f3de2]",
};
