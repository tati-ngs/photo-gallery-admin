"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { createAuthenticatedSupabaseClient } from "@/lib/supabase";

type Profile = {
  display_name: string;
  slug: string;
  whatsapp: string;
  email: string;
};

const emptyProfile: Profile = {
  display_name: "",
  slug: "",
  whatsapp: "",
  email: "",
};

export default function SettingsClient({
  accessToken,
  photographerId,
  initialProfile,
}: {
  accessToken: string;
  photographerId: string;
  initialProfile: Partial<Profile> | null;
}) {
  const supabase = createAuthenticatedSupabaseClient(accessToken);
  const [profile, setProfile] = useState<Profile>({
    ...emptyProfile,
    ...initialProfile,
  });
  const [feedback, setFeedback] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const publicProfileLink = `${process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") || ""}/photographe/${profile.slug}`;

  const handleCopyPublicLink = async () => {
    if (!profile.slug) {
      return;
    }

    const link = publicProfileLink.startsWith("/")
      ? `/photographe/${profile.slug}`
      : publicProfileLink;
    await navigator.clipboard.writeText(link);
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 2200);
  };

  const updateField = (field: keyof Profile, value: string) =>
    setProfile((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setFeedback("");

    const { error } = await supabase.from("photographer_profiles").upsert({
      id: photographerId,
      display_name: profile.display_name.trim(),
      slug: profile.slug.trim().toLowerCase(),
      whatsapp: profile.whatsapp.trim(),
      email: profile.email.trim(),
    });

    setIsSaving(false);
    setFeedback(
      error
        ? "Impossible d’enregistrer le profil. Vérifie la table et les policies Supabase."
        : "Profil enregistré avec succès.",
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f5fb] text-[#191025]">
      <div className="grid min-h-screen lg:grid-cols-[180px_1fr]">
        <aside className="bg-[#171020] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-[#6f3de2] text-sm font-black">PS</div>
            <div><p className="text-sm font-black">PS23</p><p className="text-xs text-white/45">Gestion</p></div>
          </div>
          <nav className="mt-10 grid gap-2 text-sm font-bold">
            {[
              ["Dashboard", "/dashboard"],
              ["Galeries", "/galeries"],
              ["Photos", "/photos"],
              ["Clients", "/clients"],
              ["Réglages", "/reglages"],
              ["Déconnexion", "/logout"],
            ].map(([label, href]) =>
              href === "/logout" ? (
                <form action="/logout" method="post" key={label}>
                  <button className="w-full rounded-xl px-3 py-2 text-left text-white/60 hover:bg-white/10 hover:text-white" type="submit">{label}</button>
                </form>
              ) : (
                <Link className={`rounded-xl px-3 py-2 ${label === "Réglages" ? "bg-white text-[#171020]" : "text-white/60 hover:bg-white/10 hover:text-white"}`} href={href} key={label}>{label}</Link>
              ),
            )}
          </nav>
        </aside>

        <section className="min-w-0 p-5 sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-[#6f3de2]">Profil public</p>
          <h1 className="mt-2 text-4xl font-black">Coordonnées de contact</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766985]">Ces informations seront utilisées lorsque vos clients vous contactent depuis votre profil public.</p>

          <form className="mt-8 max-w-3xl rounded-3xl border border-[#e8def5] bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold">Nom affiché<input className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 outline-none focus:border-[#6f3de2]" onChange={(event) => updateField("display_name", event.target.value)} placeholder="Julien Kouadio" required value={profile.display_name} /></label>
              <label className="grid gap-2 text-sm font-bold">Identifiant public<input className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 outline-none focus:border-[#6f3de2]" onChange={(event) => updateField("slug", event.target.value.replace(/[^a-zA-Z0-9-]/g, "-"))} placeholder="julien-kouadio" required value={profile.slug} /></label>
              <label className="grid gap-2 text-sm font-bold">WhatsApp avec indicatif<input className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 outline-none focus:border-[#6f3de2]" onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="2250700000000" required value={profile.whatsapp} /></label>
              <label className="grid gap-2 text-sm font-bold">E-mail de contact<input className="rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 py-3 outline-none focus:border-[#6f3de2]" onChange={(event) => updateField("email", event.target.value)} placeholder="contact@exemple.com" required type="email" value={profile.email} /></label>
            </div>
            {feedback && <p className="mt-5 rounded-2xl bg-[#e8fbef] px-4 py-3 text-sm font-bold text-[#197a3b]">{feedback}</p>}
            <button className="mt-6 rounded-full bg-[#6f3de2] px-6 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={isSaving} type="submit">{isSaving ? "Enregistrement..." : "Enregistrer mes coordonnées"}</button>
          </form>

          {profile.slug && (
            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#e8def5] bg-[#fbf8ff] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#766985]">
                Ton lien public : <code className="font-bold text-[#6f3de2]">/photographe/{profile.slug}</code>
              </p>
              <button
                className="rounded-full border border-[#e8def5] bg-white px-4 py-2 text-sm font-bold text-[#6f3de2]"
                onClick={handleCopyPublicLink}
                type="button"
              >
                {linkCopied ? "Lien copié" : "Copier mon lien public"}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
