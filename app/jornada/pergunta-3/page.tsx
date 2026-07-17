"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const opcoes = [
  {
    titulo: "Há poucos dias",
    descricao: "Isso começou recentemente e ainda estou tentando compreender.",
  },
  {
    titulo: "Há algumas semanas",
    descricao: "A situação vem se repetindo ou se intensificando nas últimas semanas.",
  },
  {
    titulo: "Há alguns meses",
    descricao: "Já faz algum tempo que percebo esse desconforto em minha vida.",
  },
  {
    titulo: "Há mais de um ano",
    descricao: "Essa questão já me acompanha há bastante tempo.",
  },
  {
    titulo: "Parece que sempre foi assim",
    descricao: "Tenho a sensação de que esse padrão faz parte da minha história.",
  },
];

export default function Pergunta3Page() {
  const router = useRouter();
  const [tempoSelecionado, setTempoSelecionado] = useState("");

  function continuar() {
    if (!tempoSelecionado) return;

    localStorage.setItem("aurameets_tempo_percebido", tempoSelecionado);

    router.push("/jornada/pergunta-4");
  }

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400 sm:text-sm">
            Jornada AuraMeets
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[25%] rounded-full bg-yellow-400" />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Etapa 3 de 12</p>

            <p className="text-sm text-slate-500">
              Cada resposta nos ajuda a compreender melhor o seu momento.
            </p>
          </div>
        </header>

        <section className="mt-10">
          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Há quanto tempo você sente que isso faz parte da sua vida?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Não existe resposta certa. Escolha a opção que melhor representa a
            forma como você percebe esse momento hoje.
          </p>

          <div className="mt-10 grid gap-4">
            {opcoes.map((opcao) => {
              const selecionada = tempoSelecionado === opcao.titulo;

              return (
                <button
                  key={opcao.titulo}
                  type="button"
                  onClick={() => setTempoSelecionado(opcao.titulo)}
                  aria-pressed={selecionada}
                  className={`rounded-3xl border p-6 text-left transition ${
                    selecionada
                      ? "border-yellow-400 bg-yellow-400/10 shadow-[0_12px_40px_rgba(250,204,21,0.10)]"
                      : "border-white/10 bg-[#081628] hover:border-yellow-400/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2
                        className={`text-xl font-black ${
                          selecionada ? "text-yellow-300" : "text-white"
                        }`}
                      >
                        {opcao.titulo}
                      </h2>

                      <p className="mt-3 leading-7 text-slate-400">
                        {opcao.descricao}
                      </p>
                    </div>

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
                        selecionada
                          ? "border-yellow-400 bg-yellow-400 font-black text-slate-950"
                          : "border-slate-600 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/jornada/pergunta-2")}
              className="rounded-2xl border border-slate-600 px-7 py-4 font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-300"
            >
              ← Voltar
            </button>

            <button
              type="button"
              onClick={continuar}
              disabled={!tempoSelecionado}
              className="rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuar →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}