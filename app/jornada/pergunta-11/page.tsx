"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { salvarResposta } from "@/lib/jornada";

export default function Pergunta11Page() {
  const router = useRouter();
  const [falaLivre, setFalaLivre] = useState("");

  const minimoCaracteres = 10;
  const limiteCaracteres = 700;

  const respostaValida = falaLivre.trim().length >= minimoCaracteres;

  function continuar() {
    const resposta = falaLivre.trim();

    if (resposta.length < minimoCaracteres) return;

    salvarResposta("falaLivre", resposta);

    router.push("/jornada/pergunta-12");
  }

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-4xl">
        <header>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-yellow-400 sm:text-sm">
            Jornada AuraMeets
          </p>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-[92%] rounded-full bg-yellow-400" />
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Etapa 11 de 12</p>

            <p className="text-sm text-slate-500">
              Este é um espaço para você se expressar com liberdade.
            </p>
          </div>
        </header>

        <section className="mt-10">
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            O que você sente que mais precisa ser compreendido neste momento?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Escreva com suas próprias palavras. Não precisa organizar tudo nem
            encontrar a forma perfeita de explicar. Compartilhe apenas o que
            fizer sentido para você agora.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-[#081628] p-5 sm:p-7">
            <label
              htmlFor="falaLivre"
              className="text-sm font-bold text-slate-300"
            >
              Sua resposta
            </label>

            <textarea
              id="falaLivre"
              value={falaLivre}
              onChange={(event) =>
                setFalaLivre(event.target.value.slice(0, limiteCaracteres))
              }
              maxLength={limiteCaracteres}
              rows={9}
              placeholder="Por exemplo: sinto que estou repetindo situações, mas não consigo entender por que isso acontece..."
              className="mt-4 min-h-[220px] w-full resize-none rounded-2xl border border-slate-700 bg-[#06101f] px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-yellow-400"
            />

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Escreva pelo menos {minimoCaracteres} caracteres.
              </p>

              <p className="text-sm text-slate-500">
                {falaLivre.length}/{limiteCaracteres}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/jornada/pergunta-10")}
              className="rounded-2xl border border-slate-600 px-7 py-4 font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-300"
            >
              ← Voltar
            </button>

            <button
              type="button"
              onClick={continuar}
              disabled={!respostaValida}
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