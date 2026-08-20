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
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(preferences),
  );

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

      const preferences = JSON.parse(
        saved,
      ) as CookiePreferences;

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
      className="fixed inset-x-0 bottom-0 z-[200] px-3 pb-3 sm:px-5 sm:pb-5"
      role="dialog"
      aria-modal="true"
      aria-label="Preferências de cookies"
    >
      <div className="mx-auto max-w-5xl rounded-3xl border border-yellow-300 bg-[#0b1020] p-5 text-white shadow-2xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
              Privacidade no AuraMeets
            </p>

            <h2 className="mt-2 text-xl font-black sm:text-2xl">
              Você escolhe como usamos cookies
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Usamos cookies essenciais para o site funcionar.
              Cookies de análise e marketing só serão usados
              com a sua autorização.
            </p>
          </div>

          {!customizing && (
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[500px]">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="min-h-12 rounded-2xl border border-slate-600 px-4 py-3 font-bold text-white transition hover:border-yellow-400"
              >
                RECUSAR
              </button>

              <button
                type="button"
                onClick={() => setCustomizing(true)}
                className="min-h-12 rounded-2xl border border-yellow-400 px-4 py-3 font-bold text-yellow-300 transition hover:bg-yellow-400/10"
              >
                PERSONALIZAR
              </button>

              <button
                type="button"
                onClick={acceptAll}
                className="min-h-12 rounded-2xl bg-yellow-400 px-4 py-3 font-black text-black transition hover:bg-yellow-300"
              >
                ACEITAR TODOS
              </button>
            </div>
          )}
        </div>

        {customizing && (
          <div className="mt-6 border-t border-slate-700 pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black">Essenciais</p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      Login, segurança e funcionamento do site.
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
                    SEMPRE ATIVOS
                  </span>
                </div>
              </div>

              <label className="cursor-pointer rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">Análise</p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      Ajuda a entender como o site é usado.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) =>
                      setAnalytics(event.target.checked)
                    }
                    className="mt-1 h-5 w-5 accent-yellow-400"
                  />
                </div>
              </label>

              <label className="cursor-pointer rounded-2xl border border-slate-700 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">Marketing</p>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      Usado para campanhas e anúncios personalizados.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(event) =>
                      setMarketing(event.target.checked)
                    }
                    className="mt-1 h-5 w-5 accent-yellow-400"
                  />
                </div>
              </label>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setCustomizing(false)}
                className="min-h-12 rounded-2xl border border-slate-600 px-4 py-3 font-bold text-white"
              >
                VOLTAR
              </button>

              <button
                type="button"
                onClick={rejectNonEssential}
                className="min-h-12 rounded-2xl border border-slate-600 px-4 py-3 font-bold text-white"
              >
                RECUSAR NÃO ESSENCIAIS
              </button>

              <button
                type="button"
                onClick={saveCustomPreferences}
                className="min-h-12 rounded-2xl bg-yellow-400 px-4 py-3 font-black text-black"
              >
                SALVAR PREFERÊNCIAS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}