"use client";

import Link from "next/link";

export default function JornadaHome() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a1025] via-[#2c1640] to-[#101426] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-12">
      <div className="absolute -left-16 top-10 h-52 w-52 rounded-full bg-[#8f51c6]/20 blur-3xl" />
      <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-[#ffd777]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-[1560px] gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#ead7f8]">
            <span className="h-2 w-2 rounded-full bg-[#ffd777]" />
            Jornada AuraMeets
          </div>

          <h2 className="mt-6 text-[36px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[46px] lg:text-[54px]">
            Não sabe por onde começar?
          </h2>

          <p className="mt-5 max-w-2xl text-[17px] font-medium leading-8 text-white/80">
            Responda algumas perguntas sobre o seu momento atual e receba uma
            orientação inicial para entender qual caminho pode fazer mais
            sentido para você.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/jornada"
              className="inline-flex min-h-[56px] items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ffd777] to-[#f0b83f] px-7 text-sm font-black text-[#24172f] shadow-[0_14px_30px_rgba(240,184,63,0.22)] transition hover:-translate-y-0.5"
            >
              Começar minha Jornada
              <ArrowIcon className="h-4 w-4" />
            </Link>

            <Link
              href="/terapeutas"
              className="inline-flex min-h-[56px] items-center justify-center rounded-xl border border-white/25 bg-white/10 px-7 text-sm font-extrabold text-white transition hover:bg-white/15"
            >
              Prefiro ver terapeutas
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/70">
            <span>✓ Reflexão guiada</span>
            <span>✓ Caminho personalizado</span>
            <span>✓ Indicação mais consciente</span>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d7b9ee]">
            Como funciona
          </p>

          <div className="mt-6 space-y-5">
            <Step
              number="1"
              title="Conte o que está vivendo"
              description="Responda perguntas simples sobre o seu momento atual."
            />

            <Step
              number="2"
              title="Receba uma leitura inicial"
              description="A jornada organiza suas respostas e ajuda você a enxergar prioridades."
            />

            <Step
              number="3"
              title="Descubra caminhos possíveis"
              description="Você poderá seguir para terapeutas, experiências ou acolhimento."
            />
          </div>

          <div className="mt-7 rounded-2xl border border-[#ffd777]/20 bg-[#ffd777]/10 px-5 py-4">
            <p className="text-sm font-bold text-[#ffe7a5]">
              Leva poucos minutos e pode evitar escolhas no escuro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8f51c6] text-sm font-black text-white">
        {number}
      </div>

      <div>
        <h3 className="font-black text-white">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-white/65">
          {description}
        </p>
      </div>
    </div>
  );
}

function ArrowIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}