import Link from "next/link";

import TherapistList from "@/components/terapeutas/TherapistList";
import VisitorLeadGate from "@/components/terapeutas/VisitorLeadGate";

export default function TerapeutasPage() {
  return (
    <main className="min-h-screen bg-[#060B1A] text-white">
      <VisitorLeadGate>
        <section className="border-b border-slate-800 bg-[#090F20]">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Profissionais disponíveis
            </p>

            <h1 className="mt-4 max-w-4xl text-3xl font-black sm:text-4xl">
              Conheça profissionais que podem fazer sentido para sua jornada.
            </h1>

            <p className="mt-4 max-w-3xl leading-7 text-slate-300">
              Conheça o perfil, experiência, especialidades, sessões e serviços
              de cada profissional antes de tomar sua decisão.
            </p>

            <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
              <p className="text-sm leading-6 text-slate-300">
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
              className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Voltar ao resultado da jornada
            </Link>
          </div>
        </section>
      </VisitorLeadGate>
    </main>
  );
}