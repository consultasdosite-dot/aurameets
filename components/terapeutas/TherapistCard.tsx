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

const OSCAR_PAYMENT_URL =
  "https://link.infinitepay.io/oscar_jose_ahumada_/Ri0x-HwSXUxVZzk-80,00";

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function TherapistCard({
  therapist,
  campaign = null,
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
    normalizedId.startsWith("oscarahumada");

  const activeCampaign =
    isOscar && campaign?.active ? campaign : null;

  const regularPrice =
    activeCampaign?.regularPrice ?? 800;

  const promotionalPrice =
    activeCampaign?.promotionalPrice ?? 80;

  const totalQuantity =
    activeCampaign?.totalQuantity ?? 10;

  const remainingQuantity = Math.max(
    0,
    activeCampaign?.remainingQuantity ?? 10,
  );

  const offerAvailable = remainingQuantity > 0;

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
              Oferta especial
            </p>

            <h3 className="mt-3 text-xl font-black leading-7 text-white">
              {activeCampaign?.name ??
                "10 Mapas Numerológicos Pessoais Completos"}
            </h3>

            <p className="mt-3 leading-6 text-slate-300">
              Descubra os números que influenciam sua vida, seus talentos, seus
              desafios e seu propósito.
            </p>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <span className="text-sm font-bold text-slate-500 line-through">
                De {formatCurrency(regularPrice)}
              </span>

              <span className="text-3xl font-black text-yellow-400">
                {formatCurrency(promotionalPrice)}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-yellow-400/25 bg-slate-950/40 p-4">
              {offerAvailable ? (
                <>
                  <p className="text-center text-sm font-bold text-slate-200">
                    Restam apenas
                  </p>

                  <div className="mt-2 flex items-center justify-center gap-3">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-slate-950">
                      {remainingQuantity}
                    </span>

                    <span className="max-w-44 text-sm font-black uppercase leading-5 text-yellow-400">
                      {remainingQuantity === 1
                        ? "Mapa Numerológico Pessoal Completo"
                        : "Mapas Numerológicos Pessoais Completos"}
                    </span>
                  </div>

                  <p className="mt-3 text-center text-xs font-semibold leading-5 text-slate-400">
                    Oferta disponível somente até acabar esta rodada de{" "}
                    {totalQuantity} mapas.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-center text-lg font-black text-yellow-400">
                    Esta rodada terminou
                  </p>

                  <p className="mt-2 text-center text-sm font-semibold leading-6 text-slate-300">
                    Os mapas desta rodada foram vendidos. Uma nova rodada será
                    iniciada em breve.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {isOscar ? (
          <div className="mt-7 grid gap-3">
            {offerAvailable ? (
              <a
                href={OSCAR_PAYMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
              >
                Comprar agora — {formatCurrency(promotionalPrice)}
              </a>
            ) : (
              <div className="cursor-not-allowed rounded-xl bg-slate-700 px-6 py-4 text-center font-black text-slate-400">
                Rodada encerrada
              </div>
            )}

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