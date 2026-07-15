import Link from "next/link";

import type { Therapist } from "./therapists";

type TherapistCardProps = {
  therapist: Therapist;
};

export default function TherapistCard({
  therapist,
}: TherapistCardProps) {
  const initials = therapist.nome
    .split(" ")
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("");

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111A33] shadow-xl transition hover:-translate-y-1 hover:border-yellow-400/60">
      <div className="flex min-h-56 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 p-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-4xl font-black text-yellow-400">
          {initials}
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-black text-slate-950">
            {therapist.compatibilidade}% compatível
          </span>

          <span className="text-sm font-semibold text-slate-400">
            {therapist.experiencia}
          </span>
        </div>

        <h2 className="mt-5 text-2xl font-black text-white">
          {therapist.nome}
        </h2>

        <p className="mt-2 text-sm font-semibold text-yellow-400">
          {therapist.especialidades.join(" • ")}
        </p>

        <p className="mt-3 text-sm text-slate-400">
          {therapist.cidade}
        </p>

        <p className="mt-5 leading-7 text-slate-300">
          {therapist.descricao}
        </p>

        <Link
          href={`/terapeutas/${therapist.id}`}
          className="mt-7 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
        >
          Ver perfil
        </Link>
      </div>
    </article>
  );
}