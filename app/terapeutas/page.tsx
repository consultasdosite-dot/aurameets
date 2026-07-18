import Link from "next/link";

import TherapistList from "@/components/terapeutas/TherapistList";

export default function TerapeutasPage() {
  return (
    <main className="min-h-screen bg-[#060B1A] text-white">
      <section className="border-b border-slate-800 bg-[#0B1224]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400 sm:tracking-[0.25em]">
            Terapeutas compatíveis
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Encontramos profissionais que podem fazer sentido para sua jornada.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            A ordem abaixo considera a compatibilidade inicial entre seu Perfil
            de Jornada e as especialidades de cada profissional.
          </p>

          <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
            <p className="text-sm leading-6 text-slate-300">
              A compatibilidade é uma orientação inicial. Conheça o perfil,
              formação, experiência e abordagem de cada terapeuta antes de
              tomar sua decisão.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <TherapistList />

        <div className="mt-12 flex justify-center">
          <Link
            href="/jornada/resultado"
            className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Voltar ao resultado da jornada
          </Link>
        </div>
      </section>
    </main>
  );
}