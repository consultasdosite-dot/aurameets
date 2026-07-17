"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function JornadaPage() {
  const router = useRouter();

  function iniciarJornada() {
    router.push("/jornada/pergunta-1");
  }

  return (
    <main className="min-h-screen bg-[#06101f] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <section className="w-full rounded-[36px] border border-yellow-400/20 bg-[#081628] p-6 text-center shadow-2xl sm:p-10 lg:p-16">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-yellow-400 transition hover:text-yellow-300"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-yellow-400/50 text-xl">
              ✦
            </span>

            <span className="text-2xl font-black">AuraMeets</span>
          </Link>

          <p className="mt-10 text-xs font-black uppercase tracking-[0.28em] text-yellow-400 sm:text-sm">
            Sua jornada começa aqui
          </p>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Antes de indicar um terapeuta, queremos compreender o seu momento.
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-300">
            Você encontrará perguntas simples e acolhedoras. Não existem
            respostas certas ou erradas. Compartilhe apenas aquilo que fizer
            sentido para você agora.
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#06101f] p-5">
              <p className="text-2xl font-black text-yellow-400">1</p>
              <p className="mt-2 font-bold">Você responde</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Fale sobre o que está vivendo neste momento.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#06101f] p-5">
              <p className="text-2xl font-black text-yellow-400">2</p>
              <p className="mt-2 font-bold">Nós acolhemos</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sua história será recebida com respeito e cuidado.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#06101f] p-5">
              <p className="text-2xl font-black text-yellow-400">3</p>
              <p className="mt-2 font-bold">Você recebe clareza</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ao final, apresentaremos uma fala inicial e profissionais
                compatíveis.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-left">
            <p className="font-black text-yellow-300">
              Este espaço não realiza diagnóstico.
            </p>
            <p className="mt-2 leading-7 text-slate-300">
              A experiência oferece acolhimento e reflexão inicial, mas não
              substitui acompanhamento profissional, psicológico ou médico.
            </p>
          </div>

          <button
            type="button"
            onClick={iniciarJornada}
            className="mt-10 w-full rounded-2xl bg-yellow-400 px-8 py-5 text-lg font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-yellow-300 sm:w-auto"
          >
            Começar minha jornada
          </button>

          <p className="mt-5 text-sm text-slate-500">
            Você poderá interromper o processo a qualquer momento.
          </p>
        </section>
      </div>
    </main>
  );
}