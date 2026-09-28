"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getFeaturedExperiences,
  getTherapistInitials,
  type FeaturedExperience,
} from "../../lib/experiences/home";

export default function ExperienciaPresentePage() {
  const [experiencias, setExperiencias] = useState<FeaturedExperience[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarExperiencias() {
      setCarregando(true);

      try {
        const dados = await getFeaturedExperiences();

        if (componenteAtivo) {
          setExperiencias(dados);
        }
      } catch (error) {
        console.error("Erro ao carregar Experiências Presente:", error);

        if (componenteAtivo) {
          setExperiencias([]);
        }
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    void carregarExperiencias();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fffdfb] text-[#101d3b]">
      {/* CABEÇALHO */}
      <header className="relative z-50 border-b border-[#ece5ef] bg-white shadow-[0_4px_20px_rgba(34,31,52,0.05)]">
        <div className="mx-auto flex h-[86px] max-w-[1560px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Voltar para o AuraMeets"
          >
            <AuraLogo className="h-12 w-12" />

            <span className="text-[23px] font-extrabold tracking-[-0.04em]">
              <span className="text-[#7342ad]">Aura</span>
              <span className="text-[#101d3b]">Meets</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#d9cbe5] bg-white px-5 text-sm font-extrabold text-[#63339a] transition hover:bg-[#faf7fd]"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      {/* APRESENTAÇÃO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f8f2fc] via-[#fffdfb] to-[#f3e9fa] px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#d9c1ec]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#bca0dc]/20 blur-3xl" />

        <div className="relative mx-auto max-w-[1100px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#dfceec] bg-white text-[#7541ad] shadow-[0_10px_30px_rgba(84,44,145,0.10)]">
            <GiftIcon className="h-8 w-8" />
          </div>

          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#7541ad]">
            Experiências Presente
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-[36px] font-black leading-[1.08] tracking-[-0.04em] text-[#101d3b] sm:text-[48px] lg:text-[58px]">
            Escolha uma experiência para o seu momento
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-[16px] font-medium leading-8 text-[#4d5870] sm:text-[18px]">
            Conheça experiências oferecidas pelos terapeutas AuraMeets e escolha
            aquela que mais combina com você.
          </p>

          <div className="mx-auto mt-8 h-1 w-16 rounded-full bg-gradient-to-r from-[#8b55bd] to-[#5a2d92]" />
        </div>
      </section>

      {/* EXPERIÊNCIAS */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-18 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1560px]">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7541ad]">
              Escolha quem você quer conhecer
            </p>

            <h2 className="mt-4 text-[30px] font-black leading-tight tracking-[-0.03em] text-[#101d3b] sm:text-[40px]">
              Experiências disponíveis
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-[15px] font-medium leading-7 text-[#596278]">
              Cada terapeuta oferece uma experiência especial para apresentar
              seu trabalho e proporcionar um primeiro contato com você.
            </p>
          </div>

          {carregando ? (
            <div className="mt-10 grid gap-5 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <ExperienceCardSkeleton key={index} />
              ))}
            </div>
          ) : experiencias.length > 0 ? (
            <div className="mt-10 grid gap-5 xl:grid-cols-2">
              {experiencias.map((experiencia) => (
                <ExperienceCard
                  key={experiencia.id}
                  experiencia={experiencia}
                />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-[#e4d4ef] bg-gradient-to-br from-[#fbf7ff] to-white p-8 text-center shadow-[0_14px_35px_rgba(68,42,103,0.08)] sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f1e6f9] text-[#7541ad]">
                <GiftIcon className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-[25px] font-black text-[#101d3b]">
                Novas experiências estão sendo preparadas
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-[#5c667b]">
                Os terapeutas AuraMeets estão preparando novas experiências.
                Volte em breve para conhecer as opções disponíveis.
              </p>

              <Link
                href="/terapeutas"
                className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-xl bg-gradient-to-r from-[#7e46b9] to-[#542c91] px-7 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5"
              >
                CONHECER TERAPEUTAS
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="bg-[#fbf9fc] px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7541ad]">
              Simples e acolhedor
            </p>

            <h2 className="mt-3 text-[30px] font-black tracking-[-0.03em] text-[#111e3c]">
              Como funciona
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <StepCard
              number="1"
              title="Escolha sua experiência"
              description="Conheça as opções disponíveis e encontre aquela que mais combina com o seu momento."
            />

            <StepCard
              number="2"
              title="Solicite seu presente"
              description="Clique no botão da experiência escolhida para iniciar o contato."
            />

            <StepCard
              number="3"
              title="Converse com o terapeuta"
              description="Combine diretamente com o profissional os detalhes para receber sua experiência."
            />
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="border-t border-[#eee7f2] bg-[#fbf9fc] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1560px] flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2">
            <AuraLogo className="h-10 w-10" />

            <span className="text-lg font-extrabold">
              <span className="text-[#7141a7]">Aura</span>
              <span className="text-[#111d3a]">Meets</span>
            </span>
          </div>

          <p className="text-sm text-[#687188]">
            © {new Date().getFullYear()} AuraMeets. Cuidado, conexão e
            acolhimento.
          </p>
        </div>
      </footer>
    </main>
  );
}

function ExperienceCard({
  experiencia,
}: {
  experiencia: FeaturedExperience;
}) {
  const initials = getTherapistInitials(experiencia.therapist_name);

  const contactHref =
    experiencia.whatsapp_href || experiencia.public_href;

  const isWhatsApp = Boolean(experiencia.whatsapp_href);

  return (
    <article className="group grid h-full overflow-hidden rounded-[22px] border border-[#e5d8ef] bg-white shadow-[0_12px_34px_rgba(65,39,94,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(65,39,94,0.14)] md:grid-cols-[42%_58%]">
      <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-br from-[#f4ecfa] via-white to-[#eadcf5] sm:min-h-[340px] md:min-h-full">
        {experiencia.therapist_photo_url ? (
          <img
            src={experiencia.therapist_photo_url}
            alt={`Foto de ${experiencia.therapist_name}`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_22%] transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.055]"
          />
        ) : (
          <>
            <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full border border-[#7541ad]/15" />
            <div className="absolute -bottom-14 -right-8 h-36 w-36 rounded-full border border-[#7541ad]/15" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#7440aa] to-[#a470cb] text-3xl font-black text-white shadow-xl">
                {initials}
              </div>
            </div>
          </>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1f1230]/30 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-[#2a1642]/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-white shadow-md backdrop-blur">
          <GiftIcon className="h-3.5 w-3.5" />
          EXPERIÊNCIA PRESENTE
        </span>

        {experiencia.remaining_slots > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 text-[11px] font-black text-[#66359c] shadow-md">
            {experiencia.remaining_slots === 1
              ? "1 experiência disponível"
              : `${experiencia.remaining_slots} experiências disponíveis`}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#7440aa] to-[#a470cb] text-base font-black text-white shadow-lg">
            {experiencia.therapist_photo_url ? (
              <img
                src={experiencia.therapist_photo_url}
                alt={`Foto de ${experiencia.therapist_name}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[center_22%]"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <p className="break-words text-sm font-black leading-5 text-[#1c2944]">
              {experiencia.therapist_name}
            </p>

            <p className="mt-1 break-words text-xs font-bold leading-5 text-[#7541ad]">
              {experiencia.therapist_speciality}
            </p>
          </div>
        </div>

        <h3 className="mt-4 break-words text-[22px] font-black leading-[1.22] tracking-[-0.025em] text-[#101d3b]">
          {experiencia.title}
        </h3>

        {experiencia.description && (
          <p className="mt-3 break-words text-[13px] font-medium leading-6 text-[#5b6579]">
            {experiencia.description}
          </p>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <InfoBox
            label={experiencia.display_duration}
            icon={<ClockIcon className="h-4 w-4" />}
          />

          <InfoBox
            label={experiencia.display_service_type}
            icon={<VideoIcon className="h-4 w-4" />}
          />
        </div>

        {experiencia.rules?.trim() && (
          <div className="mt-4 rounded-xl bg-[#f8f5fa] px-4 py-3">
            <p className="text-[12px] font-medium leading-5 text-[#606a7d]">
              {experiencia.rules}
            </p>
          </div>
        )}

        <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
          {isWhatsApp ? (
            <a
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7d45b5] to-[#57298f] px-4 text-center text-[12px] font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              QUERO ESTA EXPERIÊNCIA
              <ArrowIcon className="h-4 w-4 shrink-0" />
            </a>
          ) : (
            <Link
              href={contactHref}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7d45b5] to-[#57298f] px-4 text-center text-[12px] font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              QUERO ESTA EXPERIÊNCIA
              <ArrowIcon className="h-4 w-4 shrink-0" />
            </Link>
          )}

          <Link
            href={experiencia.public_href}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-[#7541ad] bg-white px-4 text-center text-[13px] font-extrabold text-[#63339a] transition hover:-translate-y-0.5 hover:bg-[#f7f0fb]"
          >
            VER PERFIL
            <ArrowIcon className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ExperienceCardSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-[22px] border border-[#e5d8ef] bg-white shadow-[0_12px_34px_rgba(65,39,94,0.07)] md:grid-cols-[42%_58%]">
      <div className="min-h-[300px] animate-pulse bg-[#e9def1]" />

      <div className="animate-pulse p-6">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 rounded-full bg-[#e9e3ed]" />

          <div className="flex-1">
            <div className="h-4 w-32 rounded bg-[#e9e3ed]" />
            <div className="mt-2 h-3 w-24 rounded bg-[#eee8f2]" />
          </div>
        </div>

        <div className="mt-5 h-6 w-4/5 rounded bg-[#e9e3ed]" />
        <div className="mt-3 h-4 w-full rounded bg-[#f0ebf3]" />
        <div className="mt-2 h-4 w-10/12 rounded bg-[#f0ebf3]" />

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="h-10 rounded-xl bg-[#f3eef5]" />
          <div className="h-10 rounded-xl bg-[#f3eef5]" />
        </div>

        <div className="mt-6 h-12 rounded-xl bg-[#ece4f1]" />
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[24px] border border-[#e8dcef] bg-white p-6 text-center shadow-[0_10px_30px_rgba(68,42,103,0.06)]">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#7541ad] text-sm font-black text-white">
        {number}
      </div>

      <h3 className="mt-5 text-[18px] font-black text-[#101d3b]">
        {title}
      </h3>

      <p className="mt-3 text-sm font-medium leading-6 text-[#596278]">
        {description}
      </p>
    </article>
  );
}

function InfoBox({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-[#f8f5fa] px-3 py-2.5 text-[11px] font-bold text-[#4b5670]">
      <span className="shrink-0 text-[#7541ad]">{icon}</span>
      <span className="min-w-0 break-words leading-4">{label}</span>
    </div>
  );
}

function AuraLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 47C22 40 18 30 20 18c8 3 13 9 12 19"
        stroke="#8B75CF"
        strokeWidth="2"
      />
      <path
        d="M32 47c10-7 14-17 12-29-8 3-13 9-12 19"
        stroke="#78B7C8"
        strokeWidth="2"
      />
      <path
        d="M32 47C17 46 8 38 6 25c10-1 19 5 24 15"
        stroke="#9C8AD6"
        strokeWidth="2"
      />
      <path
        d="M32 47c15-1 24-9 26-22-10-1-19 5-24 15"
        stroke="#71B1C6"
        strokeWidth="2"
      />
      <path
        d="M32 47C22 32 23 18 32 8c9 10 10 24 0 39Z"
        stroke="#A68CD4"
        strokeWidth="2"
      />
      <path
        d="M14 49c10 5 26 5 36 0"
        stroke="#7E68BC"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GiftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13M3 12h18" />
      <path d="M12 8H8.5a2.5 2.5 0 1 1 2.2-3.7L12 8Z" />
      <path d="M12 8h3.5a2.5 2.5 0 1 0-2.2-3.7L12 8Z" />
    </svg>
  );
}

function ClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function VideoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </svg>
  );
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}