"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { salvarResposta } from "@/lib/jornada";

const opcoes = [
  {
    titulo: "Encontrar paz interior",
    descricao:
      "Quero diminuir a agitação e me sentir mais tranquilo(a) comigo mesmo(a).",
  },
  {
    titulo: "Compreender melhor o que estou vivendo",
    descricao:
      "Preciso organizar meus sentimentos e entender o que está acontecendo.",
  },
  {
    titulo: "Melhorar meus relacionamentos",
    descricao:
      "Quero construir vínculos mais saudáveis e compreender meus padrões.",
  },
  {
    titulo: "Recuperar minha autoestima",
    descricao:
      "Quero voltar a reconhecer meu valor e confiar mais em mim.",
  },
  {
    titulo: "Tomar uma decisão importante",
    descricao:
      "Preciso de clareza para escolher um caminho com mais segurança.",
  },
  {
    titulo: "Superar um momento difícil",
    descricao:
      "Quero encontrar forças e apoio para atravessar esta fase.",
  },
  {
    titulo: "Descobrir um novo propósito",
    descricao:
      "Sinto que preciso encontrar uma direção mais conectada comigo.",
  },
  {
    titulo: "Ainda não sei, só preciso de ajuda",
    descricao:
      "Não consigo definir exatamente o que busco, mas sei que preciso de apoio.",
  },
];

export default function Pergunta6Page() {
  const router = useRouter();
  const [objetivoSelecionado, setObjetivoSelecionado] = useState("");

  function continuar() {
    if (!objetivoSelecionado) return;

    salvarResposta("objetivo", objetivoSelecionado);

    router.push("/jornada/pergunta-7");
  }

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400 sm:text-sm">
            Jornada AuraMeets
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 rounded-full bg-yellow-400" />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Etapa 6 de 12</p>

            <p className="text-sm text-slate-500">
              Agora vamos olhar para o caminho que você deseja construir.
            </p>
          </div>
        </header>

        <section className="mt-10">
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            O que você mais gostaria de conquistar neste momento?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Escolha a opção que mais representa o que você deseja encontrar com
            este processo.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {opcoes.map((opcao) => {
              const selecionada = objetivoSelecionado === opcao.titulo;

              return (
                <button
                  key={opcao.titulo}
                  type="button"
                  onClick={() => setObjetivoSelecionado(opcao.titulo)}
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
              onClick={() => router.push("/jornada/pergunta-5")}
              className="rounded-2xl border border-slate-600 px-7 py-4 font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-300"
            >
              ← Voltar
            </button>

            <button
              type="button"
              onClick={continuar}
              disabled={!objetivoSelecionado}
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