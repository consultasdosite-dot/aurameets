"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Pergunta12Page() {
  const router = useRouter();
  const [confirmado, setConfirmado] = useState(false);

  function concluirJornada() {
    if (!confirmado) return;

    localStorage.setItem(
      "aurameets_jornada_concluida",
      new Date().toISOString()
    );

    router.push("/jornada/resultado");
  }

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400 sm:text-sm">
            Jornada AuraMeets
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-full rounded-full bg-yellow-400" />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Etapa 12 de 12</p>

            <p className="text-sm text-slate-500">
              Você chegou ao final desta primeira etapa.
            </p>
          </div>
        </header>

        <section className="mt-10">
          <div className="rounded-[2rem] border border-yellow-400/20 bg-[#081628] p-7 shadow-[0_20px_70px_rgba(0,0,0,0.25)] sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Um momento para reconhecer
            </p>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Obrigado por compartilhar um pouco da sua história.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Cada resposta foi recebida com respeito. Agora o AuraMeets poderá
              organizar o que você compartilhou para apresentar uma leitura
              inicial do seu momento e indicar profissionais mais compatíveis
              com as suas necessidades.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-[#06101f] p-6">
              <h2 className="text-xl font-black text-white">
                Antes de continuar
              </h2>

              <p className="mt-3 leading-7 text-slate-400">
                O Mapa do Momento é uma reflexão de acolhimento construída a
                partir das suas respostas. Ele não representa diagnóstico
                médico ou psicológico e não substitui o atendimento de um
                profissional qualificado.
              </p>
            </div>

            <label className="mt-8 flex cursor-pointer items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-yellow-400/40">
              <input
                type="checkbox"
                checked={confirmado}
                onChange={(event) => setConfirmado(event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-yellow-400"
              />

              <span className="leading-7 text-slate-300">
                Compreendo que esta experiência tem caráter informativo e de
                acolhimento, e desejo conhecer meu Mapa do Momento.
              </span>
            </label>

            <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/jornada/pergunta-11")}
                className="rounded-2xl border border-slate-600 px-7 py-4 font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-300"
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={concluirJornada}
                disabled={!confirmado}
                className="rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Conhecer meu Mapa do Momento →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}