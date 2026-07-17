"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const opcoes = [
  {
    titulo: "Muito tranquilo(a)",
    descricao: "Consigo lidar bem com essa situação no momento.",
  },
  {
    titulo: "Um pouco preocupado(a)",
    descricao: "Isso me incomoda, mas ainda consigo manter minha rotina.",
  },
  {
    titulo: "Bastante sobrecarregado(a)",
    descricao: "Tenho sentido que essa situação está afetando meu dia a dia.",
  },
  {
    titulo: "Em sofrimento",
    descricao: "Sinto que preciso de ajuda para compreender ou enfrentar esse momento.",
  },
  {
    titulo: "Não sei explicar",
    descricao: "É difícil colocar em palavras como estou me sentindo.",
  },
];

export default function Pergunta4Page() {
  const router = useRouter();
  const [emocao, setEmocao] = useState("");

  function continuar() {
    if (!emocao) return;

    localStorage.setItem("aurameets_estado_emocional", emocao);

    router.push("/jornada/pergunta-5");
  }

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400">
            Jornada AuraMeets
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[33%] rounded-full bg-yellow-400" />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-400">Etapa 4 de 12</p>

            <p className="text-sm text-slate-500">
              Você está construindo um retrato do seu momento atual.
            </p>
          </div>
        </header>

        <section className="mt-10">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Como você descreveria o impacto dessa situação hoje?
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Escolha a alternativa que mais representa como você está se sentindo
            neste momento.
          </p>

          <div className="mt-10 grid gap-4">
            {opcoes.map((opcao) => {
              const selecionada = emocao === opcao.titulo;

              return (
                <button
                  key={opcao.titulo}
                  type="button"
                  onClick={() => setEmocao(opcao.titulo)}
                  className={`rounded-3xl border p-6 text-left transition ${
                    selecionada
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-white/10 bg-[#081628] hover:border-yellow-400/50"
                  }`}
                >
                  <h2
                    className={`text-xl font-black ${
                      selecionada ? "text-yellow-300" : "text-white"
                    }`}
                  >
                    {opcao.titulo}
                  </h2>

                  <p className="mt-3 text-slate-400">
                    {opcao.descricao}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
            <button
              onClick={() => router.push("/jornada/pergunta-3")}
              className="rounded-2xl border border-slate-600 px-7 py-4 font-bold text-slate-300 hover:border-yellow-400 hover:text-yellow-300"
            >
              ← Voltar
            </button>

            <button
              onClick={continuar}
              disabled={!emocao}
              className="rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-black text-slate-950 disabled:opacity-40"
            >
              Continuar →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}