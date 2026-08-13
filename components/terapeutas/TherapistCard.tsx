import Link from "next/link";

import type { Therapist } from "./therapists";

export type TherapistCampaign = {
  name: string;
  promotionalPrice: number;
  regularPrice: number;
  totalQuantity: number;
  remainingQuantity: number;
  active: boolean;
};

type TherapistCardProps = {
  therapist: Therapist;
  campaign?: TherapistCampaign | null;
};

export default function TherapistCard({
  therapist,
}: TherapistCardProps) {
  const initials = therapist.nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const possuiFoto = Boolean(therapist.foto?.trim());

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-800 bg-[#111A33] shadow-xl transition hover:-translate-y-1 hover:border-yellow-400/60">
      <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 p-6">
        {possuiFoto ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-yellow-400/70 bg-slate-900 shadow-[0_16px_45px_rgba(0,0,0,0.35)]">
            <img
              src={therapist.foto}
              alt={`Foto de perfil de ${therapist.nome}`}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/10 text-4xl font-black uppercase text-yellow-400">
            {initials || "AM"}
          </div>
        )}
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

        <p className="mt-2 text-sm font-semibold leading-6 text-yellow-400">
          {therapist.especialidades.join(" • ")}
        </p>

        <p className="mt-3 text-sm text-slate-400">
          {therapist.cidade}
        </p>

        <p className="mt-5 line-clamp-4 leading-7 text-slate-300">
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