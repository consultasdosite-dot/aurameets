"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { formatPhone } from "@/lib/utils";

type Experience = {
  id: number;
  therapist_id: number;
  title: string;
  description: string | null;
  duration: string | null;
  service_type: string | null;
  whatsapp_message: string | null;
  button_text: string | null;
  display_order: number | null;
};

type Therapist = {
  id: number;
  name: string | null;
  phone: string | null;
  speciality: string | null;
  city: string | null;
  state: string | null;
  photo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  slug: string | null;
};

type ExperienceCard = Experience & {
  therapist: Therapist;
};

function formatRating(value: number | null) {
  if (value === null || value === undefined) {
    return "0,0";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function ExperienciasPage() {
  const [cards, setCards] = useState<ExperienceCard[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSpeciality, setSelectedSpeciality] =
    useState("Todas");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let activeComponent = true;

    async function loadExperiences() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: experiencesData,
        error: experiencesError,
      } = await supabase
        .from("experiences")
        .select(
          `
            id,
            therapist_id,
            title,
            description,
            duration,
            service_type,
            whatsapp_message,
            button_text,
            display_order
          `,
        )
        .eq("active", true)
        .eq("approval_status", "approved")
        .order("display_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

      if (!activeComponent) {
        return;
      }

      if (experiencesError) {
        console.error(
          "Erro ao carregar experiências:",
          experiencesError,
        );

        setErrorMessage(
          "Não foi possível carregar as experiências neste momento.",
        );
        setCards([]);
        setLoading(false);
        return;
      }

      const experiences =
        (experiencesData ?? []) as Experience[];

      if (experiences.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }

      const therapistIds = Array.from(
        new Set(
          experiences.map(
            (experience) => experience.therapist_id,
          ),
        ),
      );

      const {
        data: therapistsData,
        error: therapistsError,
      } = await supabase
        .from("therapists")
        .select(
          `
            id,
            name,
            phone,
            speciality,
            city,
            state,
            photo_url,
            verified,
            rating,
            slug
          `,
        )
        .in("id", therapistIds)
        .eq("active", true);

      if (!activeComponent) {
        return;
      }

      if (therapistsError) {
        console.error(
          "Erro ao carregar terapeutas:",
          therapistsError,
        );

        setErrorMessage(
          "As experiências foram encontradas, mas não foi possível carregar os profissionais.",
        );
        setCards([]);
        setLoading(false);
        return;
      }

      const therapists =
        (therapistsData ?? []) as Therapist[];

      const therapistsById = new Map(
        therapists.map((therapist) => [
          therapist.id,
          therapist,
        ]),
      );

      const mergedCards = experiences
        .map((experience) => {
          const therapist = therapistsById.get(
            experience.therapist_id,
          );

          if (!therapist) {
            return null;
          }

          return {
            ...experience,
            therapist,
          };
        })
        .filter(
          (
            item,
          ): item is ExperienceCard => item !== null,
        );

      setCards(mergedCards);
      setLoading(false);
    }

    loadExperiences();

    return () => {
      activeComponent = false;
    };
  }, []);

  const specialities = useMemo(() => {
    const values = Array.from(
      new Set(
        cards
          .map(
            (card) =>
              card.therapist.speciality?.trim() || "",
          )
          .filter(Boolean),
      ),
    ).sort((first, second) =>
      first.localeCompare(second, "pt-BR"),
    );

    return ["Todas", ...values];
  }, [cards]);

  const filteredCards = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return cards.filter((card) => {
      const matchesSpeciality =
        selectedSpeciality === "Todas" ||
        card.therapist.speciality ===
          selectedSpeciality;

      if (!matchesSpeciality) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableContent = normalizeText(
        [
          card.title,
          card.description,
          card.duration,
          card.service_type,
          card.therapist.name,
          card.therapist.speciality,
          card.therapist.city,
          card.therapist.state,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchableContent.includes(
        normalizedSearch,
      );
    });
  }, [cards, search, selectedSpeciality]);

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-slate-800 bg-[#050816]/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black text-yellow-400"
          >
            AuraMeets
          </Link>

          <Link
            href="/terapeutas"
            className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold transition hover:border-yellow-400 hover:text-yellow-400 sm:px-5 sm:text-base"
          >
            Ver terapeutas
          </Link>
        </div>
      </header>

      <section className="w-full overflow-hidden border-b border-slate-800">
        <img
          src="/experiencias-maos.png"
          alt="Mãos envolvendo uma luz dourada"
          className="h-[260px] w-full object-cover sm:h-[380px] lg:h-[500px]"
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-yellow-400">
            Experiências Presente
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
            Escolha uma experiência. Conheça um
            terapeuta. Transforme sua jornada.
          </h1>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Encontre profissionais que oferecem uma
            experiência especial para apresentar seu
            trabalho com acolhimento, cuidado e presença.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-800 bg-[#111A33] p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div>
              <label
                htmlFor="experienceSearch"
                className="mb-2 block text-sm font-bold text-slate-300"
              >
                Buscar experiência
              </label>

              <input
                id="experienceSearch"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Nome, especialidade, cidade ou experiência"
                className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              />
            </div>

            <div>
              <label
                htmlFor="specialityFilter"
                className="mb-2 block text-sm font-bold text-slate-300"
              >
                Especialidade
              </label>

              <select
                id="specialityFilter"
                value={selectedSpeciality}
                onChange={(event) =>
                  setSelectedSpeciality(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 text-white outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10"
              >
                {specialities.map((speciality) => (
                  <option
                    key={speciality}
                    value={speciality}
                  >
                    {speciality}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

              <p className="mt-5 text-slate-300">
                Preparando as experiências...
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="mt-10 rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">
            {errorMessage}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-slate-700 bg-[#111A33] p-10 text-center sm:p-14">
            <h2 className="text-2xl font-black">
              Nenhuma experiência encontrada
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              Ajuste a busca ou volte em breve para
              conhecer novas experiências.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">
                Experiências disponíveis
              </h2>

              <p className="text-sm font-bold text-slate-400">
                {filteredCards.length}{" "}
                {filteredCards.length === 1
                  ? "experiência"
                  : "experiências"}
              </p>
            </div>

            <div className="mt-7 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
              {filteredCards.map((card) => {
                const location =
                  [
                    card.therapist.city,
                    card.therapist.state,
                  ]
                    .filter(Boolean)
                    .join(" • ") ||
                  "Atendimento online";

                const whatsappNumber = (
                  card.therapist.phone || ""
                ).replace(/\D/g, "");

                const defaultMessage = `Olá, ${
                  card.therapist.name || "terapeuta"
                }! Encontrei sua experiência no AuraMeets e gostaria de solicitar: ${
                  card.title
                }.`;

                const whatsappMessage =
                  card.whatsapp_message?.trim() ||
                  defaultMessage;

                const whatsappUrl = whatsappNumber
                  ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      whatsappMessage,
                    )}`
                  : null;

                return (
                  <article
                    key={card.id}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#111A33] shadow-xl transition duration-300 hover:-translate-y-1 hover:border-yellow-400/50"
                  >
                    <div className="relative h-64 overflow-hidden bg-[#080D22]">
                      {card.therapist.photo_url ? (
                        <img
                          src={
                            card.therapist.photo_url
                          }
                          alt={`Foto profissional de ${
                            card.therapist.name ||
                            "terapeuta"
                          }`}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-yellow-400 text-7xl font-black text-black">
                          {(
                            card.therapist.name || "T"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <span className="absolute left-4 top-4 rounded-full bg-[#050816]/90 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-yellow-400 backdrop-blur">
                        Experiência Presente
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-black">
                              {card.therapist.name ||
                                "Profissional AuraMeets"}
                            </h3>

                            {card.therapist.verified && (
                              <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-[10px] font-black uppercase text-yellow-400">
                                Verificado
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm font-bold text-slate-300">
                            {card.therapist
                              .speciality ||
                              "Especialidade não informada"}
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            {location}
                          </p>
                        </div>

                        <p className="shrink-0 font-black text-yellow-400">
                          ★{" "}
                          {formatRating(
                            card.therapist.rating,
                          )}
                        </p>
                      </div>

                      <div className="mt-6 border-t border-slate-800 pt-6">
                        <h4 className="text-2xl font-black leading-tight text-white">
                          {card.title}
                        </h4>

                        {card.description && (
                          <p className="mt-4 line-clamp-4 leading-7 text-slate-300">
                            {card.description}
                          </p>
                        )}

                        <div className="mt-5 space-y-2 text-sm text-slate-300">
                          {card.duration && (
                            <p>
                              <span className="font-bold text-white">
                                Tempo ou entrega:
                              </span>{" "}
                              {card.duration}
                            </p>
                          )}

                          {card.service_type && (
                            <p>
                              <span className="font-bold text-white">
                                Formato:
                              </span>{" "}
                              {card.service_type}
                            </p>
                          )}

                          {card.therapist.phone && (
                            <p>
                              <span className="font-bold text-white">
                                Contato:
                              </span>{" "}
                              {formatPhone(
                                card.therapist.phone,
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto grid gap-3 pt-7">
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-4 text-center font-black text-white transition hover:bg-green-500"
                          >
                            {card.button_text?.trim() ||
                              "QUERO MEU PRESENTE"}
                          </a>
                        ) : (
                          <div className="rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 text-center text-sm font-bold text-slate-400">
                            WhatsApp não informado
                          </div>
                        )}

                        {card.therapist.slug && (
                          <Link
                            href={`/terapeutas/${card.therapist.slug}`}
                            className="flex w-full items-center justify-center rounded-xl border border-slate-700 px-5 py-4 text-center font-black text-white transition hover:border-yellow-400 hover:text-yellow-400"
                          >
                            Ver perfil completo
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-16 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-black">
            Não sabe por onde começar?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
            Explore as especialidades e escolha a
            experiência que mais combina com o seu
            momento. O primeiro passo pode ser mais leve
            do que você imagina.
          </p>

          <Link
            href="/terapeutas"
            className="mt-6 inline-flex rounded-xl bg-yellow-400 px-7 py-4 font-black text-black transition hover:bg-yellow-300"
          >
            Conhecer todos os terapeutas
          </Link>
        </div>
      </section>
    </main>
  );
}