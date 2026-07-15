import Link from "next/link";
import { notFound } from "next/navigation";

import { therapists } from "@/components/terapeutas/therapists";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TherapistProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const therapist = therapists.find((item) => item.id === id);

  if (!therapist) {
    notFound();
  }

  const initials = therapist.nome
    .split(" ")
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("");

  return (
    <main className="min-h-screen bg-[#060B1A] text-white">
      <section className="border-b border-slate-800 bg-[#0B1224]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href="/terapeutas"
            className="text-sm font-bold text-slate-400 transition hover:text-yellow-400"
          >
            ← Voltar aos terapeutas
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="flex h-56 w-56 items-center justify-center rounded-full border border-yellow-400/40 bg-yellow-400/10 text-6xl font-black text-yellow-400 shadow-2xl">
                {initials}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-black text-slate-950">
                  {therapist.compatibilidade}% compatível
                </span>

                <span className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300">
                  {therapist.experiencia} de experiência
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {therapist.nome}
              </h1>

              <p className="mt-4 text-lg font-bold text-yellow-400 sm:text-xl">
                {therapist.especialidades.join(" • ")}
              </p>

              <p className="mt-3 text-slate-400">
                {therapist.cidade}
              </p>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                {therapist.descricao}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/agendar?terapeuta=${therapist.id}`}
                  className="rounded-xl bg-yellow-400 px-8 py-4 text-center text-lg font-black text-slate-950 transition hover:bg-yellow-300"
                >
                  Agendar atendimento
                </Link>

                <Link
                  href="/terapeutas"
                  className="rounded-xl border border-slate-700 px-8 py-4 text-center text-lg font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  Ver outros terapeutas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <article className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Sobre o profissional
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Uma abordagem voltada para sua jornada
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              {therapist.descricao}
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-300">
              Durante o atendimento, o profissional busca compreender o momento
              de cada pessoa e oferecer um espaço de escuta, orientação e
              desenvolvimento.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Especialidades
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Como este profissional pode ajudar
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {therapist.especialidades.map((especialidade) => (
                <div
                  key={especialidade}
                  className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5"
                >
                  <span className="font-bold text-yellow-400">✓</span>

                  <p className="mt-3 text-lg font-black text-white">
                    {especialidade}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="h-fit rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6 sm:p-8 lg:sticky lg:top-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Próximo passo
          </p>

          <h2 className="mt-4 text-2xl font-black">
            Deseja conversar com este profissional?
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            Escolha um horário disponível e avance para o agendamento.
          </p>

          <Link
            href={`/agendar?terapeuta=${therapist.id}`}
            className="mt-7 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
          >
            Ver horários disponíveis
          </Link>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            O agendamento ainda será conectado à agenda real do profissional.
          </p>
        </aside>
      </section>
    </main>
  );
}