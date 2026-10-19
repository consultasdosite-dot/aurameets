
import Link from "next/link";

import TherapistList from "@/components/terapeutas/TherapistList";

export default function TerapeutasPage() {
  return (
    <main className="min-h-screen bg-[#FCF9FF] text-[#243454]">
      <section className="border-b border-[#EADCF4] bg-[#F8EDFC]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#7935C5]">
            Profissionais disponíveis
          </p>

          <h1 className="mt-4 max-w-4xl text-3xl font-black sm:text-4xl">
            Conheça profissionais que podem fazer sentido para sua jornada.
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-[#59647B]">
            Conheça o perfil, experiência, especialidades, sessões e serviços
            de cada profissional antes de tomar sua decisão.
          </p>

          <div className="mt-6 rounded-2xl border border-[#E5D2F3] bg-white/70 p-5">
            <p className="text-sm leading-6 text-[#59647B]">
              O AuraMeets facilita o encontro entre pessoas e profissionais.
              A escolha do atendimento é sempre sua.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <TherapistList />

        <div className="mt-12 flex justify-center">
          <Link
            href="/jornada/resultado"
            className="rounded-xl border border-[#D8BCEB] px-7 py-4 text-center font-bold text-[#7935C5] transition hover:border-[#7935C5] hover:text-[#5D229D]"
          >
            Voltar ao resultado da jornada
          </Link>
        </div>
      </section>
    </main>
  );
}
