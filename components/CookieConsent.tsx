"use client";

import { useEffect, useState } from "react";

type CookiePreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "aurameets_cookie_preferences";

function savePreferences(preferences: CookiePreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

  window.dispatchEvent(
    new CustomEvent("aurameets-cookie-consent", {
      detail: preferences,
    }),
  );
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setVisible(true);
        return;
      }

      const preferences = JSON.parse(saved) as CookiePreferences;

      setAnalytics(preferences.analytics === true);
      setMarketing(preferences.marketing === true);
    } catch {
      setVisible(true);
    }
  }, []);

  function acceptAll() {
    savePreferences({
      essential: true,
      analytics: true,
      marketing: true,
      updatedAt: new Date().toISOString(),
    });

    setVisible(false);
  }

  function rejectNonEssential() {
    savePreferences({
      essential: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString(),
    });

    setAnalytics(false);
    setMarketing(false);
    setVisible(false);
  }

  function saveCustomPreferences() {
    savePreferences({
      essential: true,
      analytics,
      marketing,
      updatedAt: new Date().toISOString(),
    });

    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[200] px-2 pb-2 sm:px-4 sm:pb-4"
      role="dialog"
      aria-modal="true"
      aria-label="Preferências de cookies"
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/10 bg-[#0b1020]/95 px-4 py-3 text-white shadow-xl backdrop-blur sm:px-5 sm:py-3.5">
        {!customizing ? (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs leading-5 text-slate-300 sm:text-sm">
              <span className="font-bold text-white">
                Sua privacidade importa.
              </span>{" "}
              Usamos cookies essenciais e, com sua permissão, cookies de análise
              e marketing.
            </p>

            <div className="flex flex-wrap gap-2 md:shrink-0">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-bold text-white transition hover:border-slate-400"
              >
                Recusar
              </button>

              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="rounded-xl border border-yellow-400/60 px-3 py-2 text-xs font-bold text-yellow-300 transition hover:bg-yellow-400/10"
              >
                Personalizar
              </button>

              <button
                type="button"
                onClick={acceptAll}
                className="rounded-xl bg-yellow-400 px-3.5 py-2 text-xs font-black text-black transition hover:bg-yellow-300"
              >
                Aceitar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black text-white">
                  Preferências de cookies
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Essenciais ficam sempre ativos. Escolha os opcionais.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCustomizing(false)}
                className="self-start text-xs font-bold text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold">Essenciais</p>
                  <p className="text-[11px] text-slate-400">Login e segurança</p>
                </div>

                <span className="text-[10px] font-black text-emerald-300">
                  ATIVOS
                </span>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold">Análise</p>
                  <p className="text-[11px] text-slate-400">Uso do site</p>
                </div>

                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="h-4 w-4 accent-yellow-400"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold">Marketing</p>
                  <p className="text-[11px] text-slate-400">
                    Campanhas e anúncios
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) => setMarketing(event.target.checked)}
                  className="h-4 w-4 accent-yellow-400"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-bold text-white"
              >
                Recusar opcionais
              </button>

              <button
                type="button"
                onClick={saveCustomPreferences}
                className="rounded-xl bg-yellow-400 px-3.5 py-2 text-xs font-black text-black"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}