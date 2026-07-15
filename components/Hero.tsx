"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-[#070B16]">
      {/* Imagem para desktop e tablet */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src="/hero-maos.jpg"
          alt="Mãos conectadas por uma energia dourada"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Imagem específica para celular */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/hero-maos-mobile.jpg"
          alt="Mãos conectadas por uma energia dourada"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      {/* Camadas para melhorar a leitura */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070B16] via-[#070B16]/85 to-[#070B16]/25" />

      <div className="absolute inset-0 bg-gradient-to-t from-[#070B16] via-transparent to-black/25" />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-10 lg:py-24">
        {/* Texto principal */}
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            Conexões que transformam
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Encontre o terapeuta certo para o seu momento.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200">
            O AuraMeets conecta pessoas a terapeutas e profissionais do
            bem-estar de forma simples, segura e humana.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/cadastro-fundador"
              className="rounded-xl bg-yellow-400 px-7 py-4 text-center text-lg font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              Quero ser Terapeuta Fundador
            </Link>

            <Link
              href="/login"
              className="rounded-xl border border-white/30 bg-black/20 px-7 py-4 text-center text-lg font-bold text-white backdrop-blur-sm transition hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              Entrar na plataforma
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-300">
            Condição especial para os 100 primeiros terapeutas.
          </p>
        </div>

        {/* Card Plano Fundador */}
        <div className="rounded-3xl border border-yellow-400/30 bg-[#111A33]/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Plano Fundador
            </p>

            <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-black">
              Oferta de lançamento
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-black text-white">
            Faça parte do início do AuraMeets
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            Garanta benefícios exclusivos e uma condição especial enquanto sua
            assinatura permanecer ativa.
          </p>

          <p className="mt-7 text-lg font-bold text-slate-400 line-through">
            Valor oficial: R$ 62,00/mês
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-6xl font-black text-yellow-400">
              R$ 17,00
            </span>

            <span className="pb-2 text-lg font-bold text-white">/mês</span>
          </div>

          <p className="mt-3 font-bold text-yellow-400">
            Economia aproximada de 73%
          </p>

          <ul className="mt-8 space-y-4 text-slate-200">
            <li>✓ Selo exclusivo de Terapeuta Fundador</li>
            <li>✓ Prioridade nas primeiras buscas</li>
            <li>✓ Perfil profissional completo</li>
            <li>✓ Destaque nas campanhas oficiais</li>
          </ul>

          <Link
            href="/cadastro-fundador"
            className="mt-8 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
          >
            Garantir minha vaga
          </Link>

          <p className="mt-4 text-center text-sm text-slate-400">
            Nenhuma cobrança será realizada nesta etapa.
          </p>
        </div>
      </div>
    </section>
  );
}