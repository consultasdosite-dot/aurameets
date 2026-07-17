"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const opcoes = [
  {
    titulo: "Ansiedade",
    descricao:
      "Minha mente não para e fico preocupado(a) com o que pode acontecer.",
  },
  {
    titulo: "Medo",
    descricao:
      "Tenho receio de tomar decisões ou enfrentar essa situação.",
  },
  {
    titulo: "Tristeza",
    descricao:
      "Sinto um desânimo ou uma sensação constante de vazio.",
  },
  {
    titulo: "Raiva",
    descricao:
      "Percebo irritação, frustração ou revolta diante do que estou vivendo.",
  },
  {
    titulo: "Confusão",
    descricao:
      "Não consigo compreender exatamente o que estou sentindo.",
  },
  {
    titulo: "Esperança",
    descricao:
      "Apesar das dificuldades, acredito que posso encontrar um novo caminho.",
  },
];

export default function Pergunta5Page() {
  const router = useRouter();
  const [emocao, setEmocao] = useState("");

  function continuar() {
    if (!emocao) return;

    localStorage.setItem("aurameets_emocao_predominante", emocao);

    router.push("/jornada/pergunta-6");
  }

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">

        <header>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400">
            Jornada AuraMeets
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[42%] rounded-full bg-yellow-400" />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <p className="text-sm text-slate-400">
              Etapa 5 de 12
            </p>

            <p className="text-sm text-slate-500">
              Estamos conhecendo você com mais profundidade.
            </p>
          </div>
        </header>

        <section className="mt-10">

          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Qual emoção aparece com mais frequência quando você pensa nessa situação?
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Escolha a emoção que mais representa o seu momento atual.
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

                  <p className="mt-3 leading-7 text-slate-400">
                    {opcao.descricao}
                  </p>

                </button>

              );

            })}

          </div>

          <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">

            <button
              onClick={() => router.push("/jornada/pergunta-4")}
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