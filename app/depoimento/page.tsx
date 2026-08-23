"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Avaliacao = "GOSTEI MUITO" | "FOI BOM" | "ESPERAVA MAIS";

export default function MinhaExperienciaPage() {
  const searchParams = useSearchParams();

  const terapeuta = searchParams.get("terapeuta") || "";
  const servico = searchParams.get("servico") || "";

  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  async function avaliar(avaliacao: Avaliacao) {
    if (enviando) return;

    setEnviando(true);

    const nota =
      avaliacao === "GOSTEI MUITO"
        ? 5
        : avaliacao === "FOI BOM"
          ? 4
          : 3;

    const { error } = await supabase
      .from("depoimentos_experiencias")
      .insert({
        terapeuta: terapeuta || null,
        servico: servico || null,
        nota,
        nome: "Visitante",
        depoimento: avaliacao,
        autoriza_publicacao: false,
        status: "avaliacao",
      });

    if (error) {
      console.error("Erro ao registrar avaliação:", error);
      setEnviando(false);
      return;
    }

    setConcluido(true);
    setEnviando(false);
  }

  if (concluido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F2FA] px-5">
        <a
          href="/"
          className="flex min-h-[70px] w-full max-w-md items-center justify-center rounded-[22px] bg-gradient-to-r from-[#8B4FC1] to-[#542785] px-6 text-center text-lg font-black text-white shadow-[0_14px_35px_rgba(101,49,151,0.30)]"
        >
          VOLTAR
        </a>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F2FA] px-5">
      <div className="w-full max-w-md space-y-5">

        <button
          type="button"
          disabled={enviando}
          onClick={() => avaliar("GOSTEI MUITO")}
          className="flex min-h-[78px] w-full items-center justify-center rounded-[24px] bg-gradient-to-r from-[#8B4FC1] to-[#542785] px-6 text-xl font-black text-white shadow-[0_14px_35px_rgba(101,49,151,0.28)] transition active:scale-[0.98] disabled:opacity-60"
        >
          GOSTEI MUITO
        </button>

        <button
          type="button"
          disabled={enviando}
          onClick={() => avaliar("FOI BOM")}
          className="flex min-h-[78px] w-full items-center justify-center rounded-[24px] border-2 border-[#8B4FC1] bg-white px-6 text-xl font-black text-[#703AA8] shadow-sm transition active:scale-[0.98] disabled:opacity-60"
        >
          FOI BOM
        </button>

        <button
          type="button"
          disabled={enviando}
          onClick={() => avaliar("ESPERAVA MAIS")}
          className="flex min-h-[78px] w-full items-center justify-center rounded-[24px] border-2 border-[#D8C6E5] bg-white px-6 text-xl font-black text-[#542785] shadow-sm transition active:scale-[0.98] disabled:opacity-60"
        >
          ESPERAVA MAIS
        </button>

      </div>
    </main>
  );
}