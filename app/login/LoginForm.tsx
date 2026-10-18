"use client";

import { useState } from "react";

type LoginState = {
  error: string;
  success: string;
};

const initialState: LoginState = {
  error: "",
  success: "",
};

export default function LoginForm({
  isConfigured,
  nextPath,
}: {
  isConfigured: boolean;
  nextPath: string;
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const state = initialState;
  const isPending = false;

  return (
    <form
      action="/api/auth/login"
      autoComplete="off"
      method="post"
      className="mt-8 grid gap-5 rounded-[28px] border border-[#e8def5] bg-white p-5 shadow-[0_24px_70px_rgba(47,28,70,0.12)] sm:p-7"
    >
      <input name="intent" type="hidden" value="login" />
      <input name="next" type="hidden" value={nextPath} />
      <label className="grid gap-2 text-sm font-bold">
        Email
        <input
          autoComplete="off"
          className="h-14 rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 font-medium outline-none transition focus:border-[#6f3de2] focus:bg-white focus:shadow-[0_0_0_4px_rgba(111,61,226,0.10)]"
          disabled={!isConfigured || isPending}
          name="email"
          placeholder="photographe@email.com"
          required
          type="email"
        />
      </label>

      <label className="grid gap-2 text-sm font-bold">
        Mot de passe
        <div className="relative">
          <input
            autoComplete="new-password"
            className="h-14 w-full rounded-2xl border border-[#e8def5] bg-[#fbf8ff] px-4 pr-16 font-medium outline-none transition focus:border-[#6f3de2] focus:bg-white focus:shadow-[0_0_0_4px_rgba(111,61,226,0.10)]"
            disabled={!isConfigured || isPending}
            minLength={6}
            name="password"
            placeholder="Minimum 6 caractères"
            required
            type={isPasswordVisible ? "text" : "password"}
          />
          <button
            aria-label={
              isPasswordVisible
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-[#6f3de2] transition hover:bg-[#f1e9ff] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isConfigured || isPending}
            onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
            type="button"
          >
            {isPasswordVisible ? (
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.8" />
                <path d="M9.9 5.3A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-2.2 3.1" />
                <path d="M6.6 6.7C3.6 8.7 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4.2-.9" />
              </svg>
            )}
          </button>
        </div>
      </label>

      {state.error && (
        <p className="rounded-2xl bg-[#fff6f5] px-4 py-3 text-sm font-bold text-[#b42318]">
          {state.error}
        </p>
      )}

      {state.success && (
        <p className="rounded-2xl bg-[#e8fbef] px-4 py-3 text-sm font-bold text-[#197a3b]">
          {state.success}
        </p>
      )}

      {!isConfigured && (
        <p className="rounded-2xl bg-[#fff8e7] px-4 py-3 text-sm font-bold text-[#8a5a00]">
          Les variables Supabase ne sont pas encore configurées.
        </p>
      )}

      <button
        className="mt-1 h-14 rounded-full bg-[#6f3de2] px-5 text-sm font-black text-white shadow-lg shadow-[#6f3de2]/25 transition hover:bg-[#5c2ed0] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isConfigured || isPending}
        type="submit"
      >
        {isPending
          ? "Veuillez patienter..."
          : "Se connecter"}
      </button>
    </form>
  );
}

