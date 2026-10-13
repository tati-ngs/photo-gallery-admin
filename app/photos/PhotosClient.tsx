"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const publicPhotos: {
  src: string;
  title: string;
  category: string;
}[] = [];

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", active: false },
  { label: "Galeries", href: "/galeries", active: false },
  { label: "Photos", href: "/photos", active: true },
  { label: "Clients", href: "/clients", active: false },
  { label: "Réglages", href: "/dashboard", active: false },
];

export function PhotosClient() {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const currentPhoto = activePhoto === null ? null : publicPhotos[activePhoto];

  const showPreviousPhoto = () => {
    setActivePhoto((current) =>
      current === null
        ? 0
        : (current - 1 + publicPhotos.length) % publicPhotos.length,
    );
  };

  const showNextPhoto = () => {
    setActivePhoto((current) =>
      current === null ? 0 : (current + 1) % publicPhotos.length,
    );
  };

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
              <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#6f3de2]">
                    Photos publiques
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    Galerie publique des réalisations.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766985]">
                    Importez et organisez les images qui apparaîtront dans la
                    galerie complète du site.
                  </p>
                </div>

                <button
                  className="w-fit rounded-full bg-[#6f3de2] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#6f3de2]/25"
                  type="button"
                >
                  Importer des photos
                </button>
              </header>

              <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_280px]">
                <div className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-black">Photos publiées</h2>
                      <p className="mt-1 text-sm text-[#766985]">
                        Cliquez sur une photo pour l’agrandir et faire défiler.
                      </p>
                    </div>
                    <input
                      className="w-full rounded-full border border-[#e8def5] bg-[#fbf8ff] px-4 py-2 text-sm outline-none focus:border-[#6f3de2] sm:w-72"
                      placeholder="Rechercher une photo"
                      type="search"
                    />
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {publicPhotos.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-[#e8def5] bg-[#fbf8ff] p-5 text-sm font-bold text-[#766985] sm:col-span-2 xl:col-span-3">
                        Aucune photo publiée pour le moment.
                      </p>
                    )}

                    {publicPhotos.map((photo, index) => (
                      <article
                        className="grid overflow-hidden border border-[#eee6f7] bg-white shadow-sm"
                        key={photo.src}
                      >
                        <button
                          aria-label={`Voir ${photo.title} en grand`}
                          className="relative aspect-square bg-[#f3eef9]"
                          onClick={() => setActivePhoto(index)}
                          type="button"
                        >
                          <Image
                            alt={photo.title}
                            className="object-cover"
                            fill
                            sizes="(max-width: 768px) 100vw, 260px"
                            src={photo.src}
                          />
                        </button>
                        <div className="grid gap-3 border-t border-[#eee6f7] p-3">
                          <div className="min-h-12">
                            <p className="text-sm font-black leading-5">
                              {photo.title}
                            </p>
                            <p className="mt-1 text-xs font-bold text-[#6f3de2]">
                              {photo.category}
                            </p>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <button
                              className="flex-1 border border-[#e8def5] bg-white px-3 py-2 text-xs font-bold text-[#6f3de2]"
                              type="button"
                            >
                              Modifier
                            </button>
                            <button
                              className="flex-1 border border-[#ffd5d2] bg-[#fff0f0] px-3 py-2 text-xs font-bold text-[#b42318]"
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
                  <section className="rounded-2xl bg-gradient-to-br from-[#6f3de2] to-[#9c6cff] p-5 text-white shadow-sm">
                    <p className="text-xs font-black uppercase tracking-wide text-white/65">
                      Aperçu
                    </p>
                    <p className="mt-4 text-4xl font-black">
                      {publicPhotos.length}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white/75">
                      photos publiées.
                    </p>
                  </section>

                  <section className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black">À prévoir</h2>
                    <p className="mt-3 text-sm leading-6 text-[#766985]">
                      Plus tard, ce bouton enverra les images vers Supabase
                      Storage, puis le site public lira automatiquement les
                      nouvelles photos.
                    </p>
                  </section>
                </aside>
              </section>
            </section>
          </div>
        </div>
      </section>

      {currentPhoto && activePhoto !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#12091f]/90 p-4">
          <button
            aria-label="Fermer l’image"
            className="absolute right-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-black text-[#211332]"
            onClick={() => setActivePhoto(null)}
            type="button"
          >
            Fermer
          </button>

          <button
            aria-label="Photo précédente"
            className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-[#6f3de2] sm:flex"
            onClick={showPreviousPhoto}
            type="button"
          >
            ‹
          </button>

          <div className="w-full max-w-5xl">
            <div className="relative h-[72vh] bg-black">
              <Image
                alt={currentPhoto.title}
                className="object-contain"
                fill
                sizes="100vw"
                src={currentPhoto.src}
              />
            </div>
            <div className="flex items-center justify-between bg-white px-4 py-3">
              <div>
                <p className="font-black">{currentPhoto.title}</p>
                <p className="text-sm text-[#766985]">{currentPhoto.category}</p>
              </div>
              <p className="text-sm font-bold text-[#6f3de2]">
                {activePhoto + 1} / {publicPhotos.length}
              </p>
            </div>
          </div>

          <button
            aria-label="Photo suivante"
            className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl font-black text-[#6f3de2] sm:flex"
            onClick={showNextPhoto}
            type="button"
          >
            ›
          </button>

          <div className="mt-4 flex gap-3 sm:hidden">
            <button
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#6f3de2]"
              onClick={showPreviousPhoto}
              type="button"
            >
              Précédente
            </button>
            <button
              className="rounded-full bg-white px-5 py-3 text-sm font-black text-[#6f3de2]"
              onClick={showNextPhoto}
              type="button"
            >
              Suivante
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
