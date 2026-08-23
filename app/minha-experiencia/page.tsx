"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Avaliacao = "GOSTEI MUITO" | "FOI BOM" | "ESPERAVA MAIS";

function MinhaExperienciaConteudo() {
  const searchParams = useSearchParams();

  const visitanteNome = searchParams.get("nome")?.trim() || null;
  const visitanteWhatsapp = searchParams.get("whatsapp")?.trim() || null;
  const terapeuta = searchParams.get("terapeuta")?.trim() || null;
  const servico = searchParams.get("servico")?.trim() || null;

  const [enviando, setEnviando] = useState(false);

  async function avaliar(avaliacao: Avaliacao) {
    if (enviando) return;

    setEnviando(true);

    const { error } = await supabase
      .from("avaliacoes_experiencias")
      .insert({
        visitante_nome: visitanteNome,
        visitante_whatsapp: visitanteWhatsapp,
        terapeuta,
        servico,
        avaliacao,
        origem: "presente",
      });

    if (error) {
      console.error("Erro ao registrar avaliação:", error);
      setEnviando(false);
      alert("Não foi possível registrar sua avaliação.");
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#24122f]">
      <section className="relative min-h-screen overflow-hidden">

        <img
          src="/hero-aura-maos-limpa.png"
          alt="AuraMeets"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute left-1/2 top-8 z-20 -translate-x-1/2 sm:top-10">
          <div className="flex flex-col items-center">
            <AuraLogo className="h-16 w-16 sm:h-20 sm:w-20" />

            <div className="mt-1 whitespace-nowrap text-[34px] font-extrabold tracking-[-0.05em] sm:text-[46px]">
              <span className="text-[#7342ad]">Aura</span>
              <span className="text-[#101d3b]">Meets</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 mx-auto flex min-h-screen max-w-[1560px] items-end justify-center px-5 pb-10 sm:px-8 sm:pb-14 lg:px-12 lg:pb-16">
          <div className="grid w-full max-w-[920px] gap-3 sm:gap-4 md:grid-cols-3">

            <button
              type="button"
              disabled={enviando}
              onClick={() => avaliar("GOSTEI MUITO")}
              className="min-h-[64px] rounded-2xl bg-gradient-to-r from-[#a855b5] via-[#8244a9] to-[#5a287d] px-5 font-black text-white shadow-xl disabled:opacity-60"
            >
              GOSTEI MUITO
            </button>

            <button
              type="button"
              disabled={enviando}
              onClick={() => avaliar("FOI BOM")}
              className="min-h-[64px] rounded-2xl border-2 border-[#7d45b5] bg-white/95 px-5 font-black text-[#63309a] shadow-xl disabled:opacity-60"
            >
              FOI BOM
            </button>

            <button
              type="button"
              disabled={enviando}
              onClick={() => avaliar("ESPERAVA MAIS")}
              className="min-h-[64px] rounded-2xl bg-white/95 px-5 font-black text-[#542785] shadow-xl disabled:opacity-60"
            >
              ESPERAVA MAIS
            </button>

          </div>
        </div>
      </section>
    </main>
  );
}

function AuraLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 47C22 40 18 30 20 18c8 3 13 9 12 19"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47c10-7 14-17 12-29-8 3-13 9-12 19"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47C17 46 8 38 6 25c10-1 19 5 24 15"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47c15-1 24-9 26-22-10-1-19 5-24 15"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
      <path
        d="M32 47C22 32 23 18 32 8c9 10 10 24 0 39Z"
        stroke="#7342ad"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export default function MinhaExperienciaPage() {
  return (
    <Suspense fallback={null}>
      <MinhaExperienciaConteudo />
    </Suspense>
  );
}