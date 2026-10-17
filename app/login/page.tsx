import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminAccessTokenCookie,
  isAccessTokenValid,
  isSupabaseAuthConfigured,
} from "@/lib/adminAuth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Connexion gestion | PS23",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; created?: string }>;
}) {
  const cookieStore = await cookies();
  const currentSession = cookieStore.get(adminAccessTokenCookie)?.value;

  if (isAccessTokenValid(currentSession)) {
    redirect("/dashboard");
  }

  const { next, created } = await searchParams;
  const nextPath = next?.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";

  return (
    <main className="min-h-screen bg-[#f7f5fb] px-4 py-6 text-[#191025] sm:px-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:p-0">
      <section className="hidden min-h-screen bg-[#171020] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#6f3de2] text-sm font-black shadow-lg shadow-[#6f3de2]/30">
              PS
            </div>
            <div>
              <p className="text-base font-black">PS23</p>
              <p className="text-xs font-semibold text-white/45">Gestion studio</p>
            </div>
          </div>

          <div className="mt-24 max-w-md">
            <p className="text-xs font-black uppercase tracking-wide text-[#f5cf57]">
              Espace photographe
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-cormorant)] text-6xl font-bold leading-[0.95]">
              Gérez vos galeries avec précision.
            </h1>
            <p className="mt-6 text-sm leading-7 text-white/60">
              Créez vos espaces clients, importez les photos, envoyez les codes
              d’accès et suivez chaque galerie depuis un seul tableau de bord.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["Galeries", "Clients", "Photos"].map((item) => (
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              key={item}
            >
              <p className="text-xs font-black uppercase text-white/35">
                Module
              </p>
              <p className="mt-2 text-sm font-black">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex min-h-[calc(100vh-48px)] items-center justify-center lg:min-h-screen">
        <div className="w-full max-w-[520px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-11 items-center justify-center rounded-full bg-[#6f3de2] text-sm font-black text-white">
              PS
            </div>
            <div>
              <p className="text-sm font-black">PS23 Gestion</p>
              <p className="text-xs font-semibold text-[#766985]">
                Espace photographe
              </p>
            </div>
          </div>

          <p className="text-xs font-black uppercase tracking-wide text-[#6f3de2]">
            Accès sécurisé
          </p>
          <p className="mt-3 text-sm leading-6 text-[#766985]">
            Connectez-vous ou créez votre compte photographe pour gérer vos
            galeries, vos clients et vos photos.
          </p>

          {created === "1" && (
            <p className="mt-4 rounded-2xl bg-[#e8fbef] px-4 py-3 text-sm font-bold text-[#197a3b]">
              Compte créé. Connectez-vous avec votre e-mail et votre mot de passe.
            </p>
          )}

          <LoginForm
            isConfigured={isSupabaseAuthConfigured()}
            nextPath={nextPath}
          />
        </div>
      </section>
    </main>
  );
}

