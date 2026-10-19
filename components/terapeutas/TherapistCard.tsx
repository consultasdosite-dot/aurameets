
"use client";

import { useState } from "react";
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

function nomeProfissional(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => {
      const minusculas = parte.toLocaleLowerCase("pt-BR");

      return (
        minusculas.charAt(0).toLocaleUpperCase("pt-BR") +
        minusculas.slice(1)
      );
    })
    .join(" ");
}

export default function TherapistCard({
  therapist,
}: TherapistCardProps) {
  const [expandido, setExpandido] = useState(false);

  const nomeExibido = nomeProfissional(therapist.nome);

  const initials = nomeExibido
    .split(/\s+/)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  const possuiFoto = Boolean(therapist.foto?.trim());

  // Oculta toda a descrição do Ricardo apenas neste card.
  const ehRicardo = therapist.nome
    .trim()
    .toLocaleLowerCase("pt-BR")
    .startsWith("ricardo");

  const descricao = ehRicardo ? "" : therapist.descricao;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-[#E7D8F2] bg-white shadow-md transition hover:-translate-y-1 hover:border-[#A66AD6] hover:shadow-xl">
      <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-[#F8EDFC] to-[#EBDDF7] p-6">
        {possuiFoto ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-[#A66AD6] bg-white shadow-[0_12px_35px_rgba(100,45,145,0.15)]">
            <img
              src={therapist.foto}
              alt={`Foto de perfil de ${therapist.nome}`}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#D7B9EB] bg-[#F3E8FF] text-4xl font-black uppercase text-[#7935C5]">
            {initials || "AM"}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-[#F0E2FC] px-3 py-1 text-sm font-black text-[#7935C5]">
            PROFISSIONAL RECOMENDADO
          </span>

          <span className="text-sm font-semibold text-[#667086]">
            {therapist.experiencia}
          </span>
        </div>

        <h2 className="mt-5 text-2xl font-black text-[#243454]">
          {nomeExibido}
        </h2>

        <p className="mt-2 text-sm font-semibold leading-6 text-[#7935C5]">
          {therapist.especialidades.join(" • ")}
        </p>

        <p className="mt-3 text-sm text-[#667086]">
          {therapist.cidade}
        </p>

        {descricao && (
          <div className="mt-5">
            <p
              className={`leading-7 text-[#59647B] ${
                expandido ? "" : "line-clamp-3"
              }`}
            >
              {descricao}
            </p>

            <button
              type="button"
              onClick={() => setExpandido(!expandido)}
              aria-expanded={expandido}
              className="mt-2 text-sm font-bold text-[#7935C5] transition hover:text-[#6226A8]"
            >
              {expandido ? "VER MENOS" : "VER MAIS"}
            </button>
          </div>
        )}

        <Link
          href={`/terapeutas/${therapist.id}`}
          className="mt-auto block rounded-xl bg-[#7935C5] px-6 py-4 text-center font-black text-white transition hover:bg-[#6226A8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDA7ED]"
        >
          Ver perfil
        </Link>
      </div>
    </article>
  );
}
