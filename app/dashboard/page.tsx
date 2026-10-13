import Link from "next/link";
import { galleries, statusClasses } from "@/data/galleries";

const statCards = [
  {
    label: "Galeries actives",
    value: "12",
    percent: "30%",
    detail: "+3 ce mois",
    color: "from-[#6f3de2] to-[#9c6cff]",
  },
  {
    label: "Photos livrées",
    value: "1 284",
    percent: "75%",
    detail: "92 cette semaine",
    color: "from-[#1f1530] to-[#6f3de2]",
  },
  {
    label: "Demandes",
    value: "05",
    percent: "55%",
    detail: "à traiter",
    color: "from-[#1f1530] to-[#e65cff]",
  },
];

const chartBars = [
  { label: "Cérémonie", width: "w-[88%]", color: "bg-[#6f3de2]" },
  { label: "Shooting", width: "w-[72%]", color: "bg-[#e65cff]" },
  { label: "Marque", width: "w-[56%]", color: "bg-[#f5cf57]" },
  { label: "Conférence", width: "w-[94%]", color: "bg-[#5fd080]" },
];

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", active: true },
  { label: "Galeries", href: "/galeries", active: false },
  { label: "Photos", href: "/photos", active: false },
  { label: "Clients", href: "/clients", active: false },
  { label: "Réglages", href: "/dashboard", active: false },
];

export default function AdminDashboard() {
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

              <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-white/40">
                  Statut
                </p>
                <p className="mt-3 text-sm font-bold">Admin en construction</p>
                <p className="mt-2 text-xs leading-5 text-white/45">
                  Les données seront reliées au backend plus tard.
                </p>
              </div>
            </aside>

            <section className="min-w-0 p-5 sm:p-7">
              <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#6f3de2]">
                    Tableau de bord
                  </p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                    Vue rapide sur PS23 Photography.
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766985]">
                    Suivez les galeries clients, les photos livrées et les
                    prochaines actions depuis un espace simple.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    className="rounded-full bg-[#6f3de2] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#6f3de2]/25"
                    href="/galeries"
                  >
                    Créer une galerie
                  </Link>
                  <Link
                    className="rounded-full border border-[#ded4ee] bg-white px-4 py-2 text-sm font-bold text-[#6f3de2]"
                    href="/photos"
                  >
                    Importer des photos
                  </Link>
                </div>
              </header>

              <section className="mt-6 grid gap-4 xl:grid-cols-3">
                {statCards.map((card, index) => (
                  <article
                    className={`rounded-2xl p-5 shadow-sm ${
                      index === 0
                        ? "bg-gradient-to-br text-white"
                        : "border border-[#e8def5] bg-white"
                    } ${index === 0 ? card.color : ""}`}
                    key={card.label}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p
                          className={`text-xs font-black uppercase tracking-wide ${
                            index === 0 ? "text-white/70" : "text-[#8a7a9f]"
                          }`}
                        >
                          {card.label}
                        </p>
                        <p className="mt-3 text-3xl font-black">{card.value}</p>
                        <p
                          className={`mt-1 text-xs font-bold ${
                            index === 0 ? "text-white/75" : "text-[#6f3de2]"
                          }`}
                        >
                          {card.detail}
                        </p>
                      </div>
                      <div className="grid size-16 place-items-center rounded-full border-[7px] border-[#efe8ff] bg-white text-sm font-black text-[#6f3de2]">
                        {card.percent}
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <section className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.15fr_0.85fr]">
                <div className="grid gap-5">
                  <article className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black">À valider</h2>
                    <p className="mt-2 text-sm leading-6 text-[#766985]">
                      5 demandes sont en attente avant création ou livraison.
                    </p>
                    <Link
                      className="mt-5 inline-flex rounded-full bg-[#f1e9ff] px-4 py-2 text-xs font-black text-[#6f3de2]"
                      href="/galeries"
                    >
                      Voir les galeries
                    </Link>
                  </article>

                  <article className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black">Dernier ajout</h2>
                    <p className="mt-3 text-2xl font-black">Brand Studio</p>
                    <p className="mt-1 text-sm text-[#766985]">
                      86 photos ajoutées dans Marque & entreprise.
                    </p>
                  </article>
                </div>

                <article className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-black">Répartition</h2>
                      <p className="mt-1 text-sm text-[#766985]">
                        Photos par type de prestation.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f1e9ff] px-3 py-1 text-xs font-black text-[#6f3de2]">
                      mois
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {chartBars.map((bar) => (
                      <div key={bar.label}>
                        <div className="mb-2 flex justify-between text-xs font-bold text-[#766985]">
                          <span>{bar.label}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-[#eee8f7]">
                          <div className={`h-full rounded-full ${bar.width} ${bar.color}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-[#e8def5] bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-black">Ce mois</h2>
                  <div className="mt-6 grid place-items-center">
                    <div className="grid size-36 place-items-center rounded-full bg-[conic-gradient(#6f3de2_0_70%,#f0e9fb_70%_100%)] p-4">
                      <div className="grid size-24 place-items-center rounded-full bg-white text-center">
                        <p className="text-2xl font-black">70%</p>
                        <p className="text-xs font-bold text-[#766985]">
                          livré
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-center text-sm leading-6 text-[#766985]">
                    La majorité des galeries prévues sont déjà prêtes.
                  </p>
                </article>
              </section>

              <section className="mt-5 rounded-2xl border border-[#e8def5] bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-[#eee6f7] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-black">Galeries récentes</h2>
                    <p className="mt-1 text-sm text-[#766985]">
                      Les derniers espaces client créés ou mis à jour.
                    </p>
                  </div>
                  <Link
                    className="w-fit rounded-full bg-[#f1e9ff] px-4 py-2 text-xs font-black text-[#6f3de2]"
                    href="/galeries"
                  >
                    Voir toutes
                  </Link>
                </div>

                <div className="grid divide-y divide-[#eee6f7]">
                  {galleries.map((gallery) => (
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
                      <p className="font-mono text-xs font-black text-[#6f3de2]">
                        {gallery.code}
                      </p>
                      <p className="text-sm font-black">
                        {gallery.photos} photos
                      </p>
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
