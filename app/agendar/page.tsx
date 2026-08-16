"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

function AgendarCompatibilidadeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function redirecionar() {
      const terapeutaParam = searchParams.get("terapeuta")?.trim() ?? "";

      if (!terapeutaParam) {
        if (ativo) {
          setErro("O terapeuta não foi identificado neste link.");
        }
        return;
      }

      const terapeutaId = Number(terapeutaParam);

      if (!Number.isInteger(terapeutaId) || terapeutaId <= 0) {
        if (ativo) {
          setErro("O código do terapeuta informado é inválido.");
        }
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .select("slug")
        .eq("id", terapeutaId)
        .eq("active", true)
        .maybeSingle();

      if (!ativo) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao localizar terapeuta para redirecionamento:",
          error,
        );

        setErro(
          "Não foi possível localizar este profissional. Tente novamente.",
        );
        return;
      }

      const slug = data?.slug?.trim();

      if (!slug) {
        setErro(
          "Este profissional ainda não possui um endereço de agendamento disponível.",
        );
        return;
      }

      const destinoParams = new URLSearchParams();

      searchParams.forEach((value, key) => {
        if (key !== "terapeuta") {
          destinoParams.append(key, value);
        }
      });

      const queryString = destinoParams.toString();

      router.replace(
        `/agendar/${encodeURIComponent(slug)}${
          queryString ? `?${queryString}` : ""
        }`,
      );
    }

    void redirecionar();

    return () => {
      ativo = false;
    };
  }, [router, searchParams]);

  if (erro) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
        <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#111A33] p-8 text-center shadow-2xl">
          <p className="text-2xl font-black text-yellow-400">
            AuraMeets
          </p>

          <h1 className="mt-7 text-3xl font-black">
            Não foi possível abrir o agendamento
          </h1>

          <p className="mt-4 leading-7 text-slate-300">
            {erro}
          </p>

          <Link
            href="/terapeutas"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300"
          >
            VER TERAPEUTAS
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

        <p className="mt-5 text-slate-300">
          Abrindo o agendamento...
        </p>
      </div>
    </main>
  );
}

export default function AgendarCompatibilidadePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

            <p className="mt-5 text-slate-300">
              Preparando o agendamento...
            </p>
          </div>
        </main>
      }
    >
      <AgendarCompatibilidadeContent />
    </Suspense>
  );
}