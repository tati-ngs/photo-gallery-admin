"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { galleries, statusClasses } from "@/data/galleries";

type Gallery = (typeof galleries)[number];

const initialForm = {
  client: "",
  type: "",
  date: "",
};

const galleriesStorageKey = "ps23-admin-galleries";

const generateGalleryCode = (clientName: string, galleryNumber: number) => {
  const readableName = clientName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();

  const formattedNumber = String(galleryNumber).padStart(3, "0");

  return `PS23-${readableName || "CLIENT"}-${formattedNumber}`;
};

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", active: false },
  { label: "Galeries", href: "/galeries", active: true },
  { label: "Photos", href: "/photos", active: false },
  { label: "Clients", href: "/clients", active: false },
  { label: "Réglages", href: "/dashboard", active: false },
];

export default function GaleriesClient() {
  const [galleryList, setGalleryList] = useState<Gallery[]>(() => {
    if (typeof window === "undefined") {
      return galleries;
    }

    const savedGalleries = window.localStorage.getItem(galleriesStorageKey);

    return savedGalleries ? JSON.parse(savedGalleries) : galleries;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const generatedCode = generateGalleryCode(form.client, galleryList.length + 1);
  const filteredGalleries = galleryList.filter((gallery) => {
    const searchableText = `${gallery.client} ${gallery.code} ${gallery.type}`
      .toLowerCase()
      .trim();

    return searchableText.includes(search.toLowerCase().trim());
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Pour l'instant, la galerie est ajoutée seulement dans l'interface.
    // Quand le backend sera prêt, cette partie enverra les données à la base.
    const nextGalleryList = [
      {
        client: form.client,
        type: form.type,
        date: form.date,
        code: generatedCode,
        photos: "0",
        status: "Brouillon",
      },
      ...galleryList,
    ];

    window.localStorage.setItem(
      galleriesStorageKey,
      JSON.stringify(nextGalleryList),
    );
    setGalleryList(nextGalleryList);

    setForm(initialForm);
    setIsFormOpen(false);
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
                    Galeries clients
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    Créer et piloter les espaces privés.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766985]">
                    Chaque galerie correspond à un client, un code d’accès et
                    une sélection de photos à livrer.
                  </p>
                </div>

                <button
                  className="w-fit rounded-full bg-[#6f3de2] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#6f3de2]/25"
                  onClick={() => setIsFormOpen((currentValue) => !currentValue)}
                  type="button"
                >
                  {isFormOpen ? "Fermer" : "Créer une galerie"}
                </button>
              </header>

              {isFormOpen && (
                <section className="mt-6 rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <div className="max-w-4xl">
                    <p className="text-xs font-black uppercase tracking-wide text-[#6f3de2]">
                      Nouvelle galerie
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Préparer un espace client
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#766985]">
                      Renseignez les informations principales. Les photos seront
                      ajoutées ensuite depuis la page détail de la galerie.
                    </p>
                  </div>

                  <form
                    className="mt-5 grid gap-4 lg:grid-cols-2"
                    onSubmit={handleSubmit}
                  >
                    <label className="grid gap-2 text-sm font-bold">
                      Nom du client *
                      <input
                        className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 font-medium outline-none focus:border-[#6f3de2]"
                        onChange={(event) =>
                          setForm({ ...form, client: event.target.value })
                        }
                        placeholder="Ex : Tatiana N'guessan"
                        required
                        type="text"
                        value={form.client}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold">
                      Type de séance *
                      <select
                        className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 font-medium outline-none focus:border-[#6f3de2]"
                        onChange={(event) =>
                          setForm({ ...form, type: event.target.value })
                        }
                        required
                        value={form.type}
                      >
                        <option value="">Choisir un type</option>
                        <option value="Shooting & lifestyle">
                          Shooting & lifestyle
                        </option>
                        <option value="Cérémonie">Cérémonie</option>
                        <option value="Marque & entreprise">
                          Marque & entreprise
                        </option>
                        <option value="Conférence">Conférence</option>
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-bold">
                      Date de la séance *
                      <input
                        className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 font-medium outline-none focus:border-[#6f3de2]"
                        onChange={(event) =>
                          setForm({ ...form, date: event.target.value })
                        }
                        required
                        type="date"
                        value={form.date}
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold">
                      Code galerie automatique
                      <div className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 font-mono text-sm font-bold uppercase text-[#6f3de2]">
                        {generatedCode}
                      </div>
                    </label>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row lg:col-span-2">
                      <button
                        className="rounded-full bg-[#6f3de2] px-5 py-3 text-sm font-bold text-white"
                        type="submit"
                      >
                        Enregistrer la galerie
                      </button>
                      <button
                        className="rounded-full border border-[#e8def5] px-5 py-3 text-sm font-bold text-[#6f3de2]"
                        onClick={() => {
                          setForm(initialForm);
                          setIsFormOpen(false);
                        }}
                        type="button"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </section>
              )}

              <section className="mt-6 rounded-2xl border border-[#e8def5] bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-[#eee6f7] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black">Toutes les galeries</h2>
                    <p className="mt-1 text-sm text-[#766985]">
                      Liste des espaces client créés dans l’admin.
                    </p>
                  </div>
                  <input
                    className="w-full rounded-full border border-[#e8def5] bg-[#fbf8ff] px-4 py-2 text-sm outline-none focus:border-[#6f3de2] sm:w-72"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher un client ou un code"
                    type="search"
                    value={search}
                  />
                </div>

                <div className="grid divide-y divide-[#eee6f7]">
                  {filteredGalleries.map((gallery) => (
                    <article
                      className="grid gap-4 p-5 md:grid-cols-[1fr_0.8fr_0.45fr_auto] md:items-center"
                      key={gallery.code}
                    >
                      <div>
                        <p className="font-black">{gallery.client}</p>
                        <p className="mt-1 text-sm text-[#766985]">
                          {gallery.type}
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-xs font-black text-[#6f3de2]">
                          {gallery.code}
                        </p>
                        <p className="mt-1 text-xs text-[#766985]">
                          Séance du {gallery.date}
                        </p>
                      </div>
                      <p className="text-sm font-black">{gallery.photos} photos</p>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            statusClasses[gallery.status]
                          }`}
                        >
                          {gallery.status}
                        </span>
                        <Link
                          className="rounded-full border border-[#e8def5] px-3 py-1.5 text-xs font-black text-[#6f3de2]"
                          href={`/galeries/${gallery.code}`}
                        >
                          Ouvrir
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
