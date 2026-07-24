import Link from "next/link";

import type { Therapist } from "./therapists";

type TherapistCardProps = {
  therapist: Therapist;
};

const OSCAR_PAYMENT_URL =
  "https://invoice.infinitepay.io/oscar_jose_ahumada_/LBCJSjfHjP";

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

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

  const normalizedName = normalizeText(therapist.nome);
  const normalizedId = normalizeText(therapist.id);

  const isOscar =
    normalizedName === "oscarahumada" ||
    normalizedId === "oscarahumada";

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

        {isOscar && (
          <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
              Oferta de lançamento
            </p>

            <h3 className="mt-3 text-xl font-black text-white">
              Mapa Numerológico Pessoal
            </h3>

            <p className="mt-3 leading-6 text-slate-300">
              Descubra os números que influenciam sua vida, seus talentos e seu
              propósito.
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <span className="text-sm font-bold text-slate-500 line-through">
                De R$ 800,00
              </span>

              <span className="text-3xl font-black text-yellow-400">
                R$ 35,00
              </span>
            </div>
          </div>
        )}

        {isOscar ? (
          <div className="mt-7 grid gap-3">
            <a
              href={OSCAR_PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              Comprar agora
            </a>

            <Link
              href={`/terapeutas/${therapist.id}`}
              className="block rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              Ver perfil
            </Link>
          </div>
        ) : (
          <Link
            href={`/terapeutas/${therapist.id}`}
            className="mt-7 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
          >
            Ver perfil
          </Link>
        )}
      </div>
    </article>
  );
}