import Image from "next/image";
import Link from "next/link";

const galleryDetails = {
  client: "Tatiana N'guessan",
  code: "PS23-TATIANA",
  type: "Shooting & lifestyle",
  date: "10/10/2026",
  status: "Prête",
  totalPhotos: 42,
  deliveredPhotos: 30,
};

const photos = [
  {
    src: "/gallery-samples/shooting.jpeg",
    alt: "Portrait lifestyle du client",
    label: "Sélection",
  },
  {
    src: "/gallery-samples/mariage.jpeg",
    alt: "Photo de cérémonie",
    label: "À valider",
  },
  {
    src: "/gallery-samples/marque.jpg",
    alt: "Photo de marque",
    label: "Livrée",
  },
  {
    src: "/gallery-samples/conference.jpeg",
    alt: "Photo de conférence",
    label: "Livrée",
  },
  {
    src: "/gallery-samples/matiere.jpg",
    alt: "Photo de détail",
    label: "Retouche",
  },
];

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", active: false },
  { label: "Galeries", href: "/galeries", active: true },
  { label: "Photos", href: "/photos", active: false },
  { label: "Clients", href: "/clients", active: false },
  { label: "Réglages", href: "/dashboard", active: false },
];

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-[#191025]">
      <section className="min-h-screen">
        <div className="min-h-screen bg-[#f7f5fb]">
          <div className="grid min-h-screen lg:grid-cols-[180px_1fr]">
            <aside className="bg-[#171020] p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-[#6f3de2] text-sm font-black">
                  PS
                </div>
                <div>
                  <p className="text-sm font-black">PS23</p>
                  <p className="text-xs text-white/45">Gestion</p>
                </div>
              </div>

              <nav className="mt-10 grid gap-2 text-sm font-bold">
                {sidebarLinks.map((link) => (
                  <Link
                    className={`rounded-xl px-3 py-2 transition ${
                      link.active
                        ? "bg-white text-[#171020]"
                        : "text-white/55 hover:bg-white/10 hover:text-white"
                    }`}
                    href={link.href}
                    key={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </aside>

            <section className="min-w-0 p-5 sm:p-7">
              <Link
                className="inline-flex rounded-full border border-[#e8def5] bg-white px-4 py-2 text-sm font-black text-[#6f3de2]"
                href="/galeries"
              >
                ← Retour aux galeries
              </Link>

              <header className="mt-5 grid gap-5 rounded-2xl bg-gradient-to-br from-[#6f3de2] to-[#9c6cff] p-5 text-white shadow-sm lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-white/65">
                    Galerie client
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    {galleryDetails.client}
                  </h1>
                  <p className="mt-2 text-sm text-white/75">
                    Code demandé : {code}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#6f3de2]"
                    type="button"
                  >
                    Ajouter des photos
                  </button>
                  <button
                    className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white"
                    type="button"
                  >
                    Envoyer le code
                  </button>
                </div>
              </header>

              <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Type
                  </p>
                  <p className="mt-2 font-black">{galleryDetails.type}</p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Date
                  </p>
                  <p className="mt-2 font-black">{galleryDetails.date}</p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Photos
                  </p>
                  <p className="mt-2 font-black">{galleryDetails.totalPhotos}</p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Statut
                  </p>
                  <p className="mt-2 font-black text-[#6f3de2]">
                    {galleryDetails.status}
                  </p>
                </article>
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
                <div className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-black">
                        Photos de la galerie
                      </h2>
                      <p className="mt-1 text-sm text-[#766985]">
                        Aperçu admin des images qui seront visibles côté client.
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-[#f1e9ff] px-3 py-1 text-xs font-black text-[#6f3de2]">
                      {galleryDetails.deliveredPhotos} livrées
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.map((photo) => (
                      <article
                        className="overflow-hidden border border-[#eee6f7] bg-[#fbf8ff] shadow-sm"
                        key={photo.src}
                      >
                        <div className="relative aspect-square">
                          <Image
                            alt={photo.alt}
                            className="object-cover"
                            fill
                            sizes="(max-width: 768px) 100vw, 260px"
                            src={photo.src}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 p-3">
                          <span className="text-xs font-bold text-[#766985]">
                            {photo.label}
                          </span>
                          <div className="flex gap-2">
                            <button
                              className="border border-[#e8def5] bg-white px-3 py-1 text-xs font-bold text-[#6f3de2]"
                              type="button"
                            >
                              Modifier
                            </button>
                            <button
                              className="border border-[#ffd5d2] bg-[#fff0f0] px-3 py-1 text-xs font-bold text-[#b42318]"
                              type="button"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <aside className="grid gap-5">
                  <section className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black">Accès client</h2>
                    <div className="mt-4 grid gap-3 text-sm">
                      <p className="flex justify-between gap-4">
                        <span className="text-[#766985]">Code</span>
                        <span className="font-mono text-xs font-black">
                          {galleryDetails.code}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-[#766985]">Client</span>
                        <span className="font-black">
                          {galleryDetails.client}
                        </span>
                      </p>
                      <p className="flex justify-between gap-4">
                        <span className="text-[#766985]">Statut</span>
                        <span className="font-black text-[#6f3de2]">
                          {galleryDetails.status}
                        </span>
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl bg-[#171020] p-5 text-white shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-white/45">
                      Prochaine logique
                    </p>
                    <h2 className="mt-3 text-xl font-black">
                      Connexion à Supabase.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/60">
                      L’admin créera les galeries, ajoutera les photos, puis le
                      client verra les mêmes images depuis son espace privé.
                    </p>
                  </section>
                </aside>
              </section>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
