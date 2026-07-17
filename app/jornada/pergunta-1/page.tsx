"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Pergunta1Page() {
  const router = useRouter();
  const [resposta, setResposta] = useState("");

  function continuar() {
    if (!resposta.trim()) return;

    // Em breve salvaremos no banco de dados.
    router.push("/jornada/pergunta-2");
  }

  return (
    <main className="min-h-screen bg-[#06101f] text-white px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <div className="mb-10">
          <p className="text-yellow-400 font-bold uppercase tracking-[0.3em] text-sm">
            Jornada AuraMeets
          </p>

          <div className="mt-4 h-2 rounded-full bg-slate-800">
            <div className="h-2 w-[8%] rounded-full bg-yellow-400"></div>
          </div>

          <p className="mt-3 text-sm text-slate-400">
            Etapa 1 de 12
          </p>
        </div>

        <h1 className="text-5xl font-black leading-tight">
          O que fez você procurar o AuraMeets neste momento?
        </h1>

        <p className="mt-6 text-xl leading-9 text-slate-300">
          Não existe resposta certa ou errada.

          Escreva apenas aquilo que seu coração deseja compartilhar.

          Você será acolhido com respeito.
        </p>

        <textarea
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          placeholder="Escreva aqui..."
          className="mt-10 w-full h-56 rounded-3xl bg-[#081628] border border-slate-700 p-6 text-lg outline-none focus:border-yellow-400"
        />

        <div className="mt-12 flex justify-end">

          <button
            onClick={continuar}
            disabled={!resposta.trim()}
            className="rounded-2xl bg-yellow-400 px-10 py-5 text-black text-lg font-black disabled:opacity-40"
          >
            Continuar →
          </button>

        </div>

      </div>
    </main>
  );
}