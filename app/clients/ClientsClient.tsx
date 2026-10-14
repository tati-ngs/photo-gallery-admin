"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type ClientGallery = {
  id?: number;
  client: string;
  contact?: string;
  code: string;
  type: string;
  date: string;
  photos: number;
  status: string;
  created_at?: string;
};

type ClientsClientProps = {
  galleries: ClientGallery[];
  statusClasses: Record<"Brouillon" | "Prête" | "Livrée", string>;
};

type ClientGroup = {
  key: string;
  name: string;
  contact?: string;
  galleries: ClientGallery[];
  totalPhotos: number;
};

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", active: false },
  { label: "Galeries", href: "/galeries", active: false },
  { label: "Photos", href: "/photos", active: false },
  { label: "Clients", href: "/clients", active: true },
  { label: "Réglages", href: "/dashboard", active: false },
];

const getStatusClass = (
  status: string,
  statusClasses: ClientsClientProps["statusClasses"],
) =>
  statusClasses[status as keyof ClientsClientProps["statusClasses"]] ??
  statusClasses.Brouillon;

const normalizeClientIdentity = (value: string) =>
  value.toLowerCase().replace(/\s+/g, "").trim();

const getClientGroupKey = (gallery: ClientGallery) =>
  gallery.contact
    ? `contact:${normalizeClientIdentity(gallery.contact)}`
    : `name:${normalizeClientIdentity(gallery.client)}`;

const getGalleryKey = (gallery: ClientGallery) =>
  gallery.id
    ? String(gallery.id)
    : `${gallery.code}-${gallery.date}-${gallery.created_at ?? ""}`;

const getClientGroups = (galleries: ClientGallery[]) => {
  const groups = new Map<string, ClientGroup>();

  galleries.forEach((gallery) => {
    const groupKey = getClientGroupKey(gallery);
    const currentGroup = groups.get(groupKey);

    if (currentGroup) {
      currentGroup.galleries.push(gallery);
      currentGroup.totalPhotos += Number(gallery.photos || 0);
      currentGroup.contact = currentGroup.contact || gallery.contact;
      return;
    }

    groups.set(groupKey, {
      key: groupKey,
      name: gallery.client,
      contact: gallery.contact,
      galleries: [gallery],
      totalPhotos: Number(gallery.photos || 0),
    });
  });

  return Array.from(groups.values());
};

export default function ClientsClient({
  galleries,
  statusClasses,
}: ClientsClientProps) {
  const [search, setSearch] = useState("");
  const readyGalleries = galleries.filter(
    (gallery) => gallery.status === "Prête",
  ).length;
  const deliveredGalleries = galleries.filter(
    (gallery) => gallery.status === "Livrée",
  ).length;
  const clientGroups = useMemo(() => getClientGroups(galleries), [galleries]);
  const filteredClients = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();

    if (!normalizedSearch) {
      return clientGroups;
    }

    return clientGroups.filter((client) =>
      `${client.name} ${client.contact ?? ""} ${client.galleries
        .map((gallery) => `${gallery.code} ${gallery.type} ${gallery.status}`)
        .join(" ")}`
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [clientGroups, search]);

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
                    Clients
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    Suivi des clients et de leurs galeries.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766985]">
                    Retrouvez rapidement chaque client, son code galerie, son
                    statut et le nombre de photos associées.
                  </p>
                </div>

                <Link
                  className="w-fit rounded-full bg-[#6f3de2] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#6f3de2]/25"
                  href="/galeries"
                >
                  Créer une galerie
                </Link>
              </header>

              <section className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl bg-gradient-to-br from-[#6f3de2] to-[#9c6cff] p-5 text-white shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-white/65">
                    Clients
                  </p>
                  <p className="mt-3 text-4xl font-black">{clientGroups.length}</p>
                  <p className="mt-2 text-sm font-medium text-white/75">
                    clients enregistrés.
                  </p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Galeries prêtes
                  </p>
                  <p className="mt-3 text-4xl font-black">{readyGalleries}</p>
                  <p className="mt-2 text-sm font-bold text-[#6f3de2]">
                    à envoyer au client
                  </p>
                </article>
                <article className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-[#8a7a9f]">
                    Livrées
                  </p>
                  <p className="mt-3 text-4xl font-black">{deliveredGalleries}</p>
                  <p className="mt-2 text-sm font-bold text-[#6f3de2]">
                    galeries terminées
                  </p>
                </article>
              </section>

              <section className="mt-6 rounded-2xl border border-[#e8def5] bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-[#eee6f7] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black">Liste des clients</h2>
                    <p className="mt-1 text-sm text-[#766985]">
                      Vue simple des clients liés aux galeries.
                    </p>
                  </div>
                  <input
                    className="w-full rounded-full border border-[#e8def5] bg-[#fbf8ff] px-4 py-2 text-sm outline-none focus:border-[#6f3de2] sm:w-72"
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Rechercher un client"
                    type="search"
                    value={search}
                  />
                </div>

                <div className="grid divide-y divide-[#eee6f7]">
                  {filteredClients.length === 0 && (
                    <p className="p-5 text-sm font-bold text-[#766985]">
                      Aucun client enregistré pour le moment.
                    </p>
                  )}

                  {filteredClients.map((client) => (
                    <article
                      className="grid gap-4 p-5 md:grid-cols-[0.8fr_1.4fr_0.45fr] md:items-start"
                      key={client.key}
                    >
                      <div>
                        <p className="font-black">{client.name}</p>
                        {client.contact && (
                          <p className="mt-1 text-xs font-bold text-[#6f3de2]">
                            {client.contact}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-[#766985]">
                          {client.galleries.length} galerie{client.galleries.length > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        {client.galleries.map((gallery) => (
                          <div
                            className="grid gap-2 rounded-2xl border border-[#eee6f7] bg-[#fbf8ff] p-3 lg:grid-cols-[1fr_auto] lg:items-center"
                            key={getGalleryKey(gallery)}
                          >
                            <div>
                              <p className="font-mono text-xs font-black text-[#6f3de2]">
                                {gallery.code}
                              </p>
                              <p className="mt-1 text-sm text-[#766985]">
                                {gallery.type} · Séance du {gallery.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                                  gallery.status,
                                  statusClasses,
                                )}`}
                              >
                                {gallery.status}
                              </span>
                              <Link
                                className="rounded-full border border-[#e8def5] bg-white px-3 py-1.5 text-xs font-black text-[#6f3de2]"
                                href={`/galeries/${gallery.code}`}
                              >
                                Ouvrir
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-black">
                        {client.totalPhotos} photo{client.totalPhotos > 1 ? "s" : ""}
                      </p>
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
