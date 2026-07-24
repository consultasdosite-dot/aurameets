import Link from "next/link";
import { notFound } from "next/navigation";

import { getTherapistBySlug } from "@/lib/therapists";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const OSCAR_PAYMENT_URL =
  "https://invoice.infinitepay.io/oscar_jose_ahumada_/LBCJSjfHjP";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function splitSpecialities(value: string | null) {
  if (!value) {
    return ["Especialidade não informada"];
  }

  return value
    .split(/[,•]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default async function TherapistProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const therapist = await getTherapistBySlug(id);

  if (!therapist) {
    notFound();
  }

  const initials = getInitials(therapist.name);
  const specialities = splitSpecialities(therapist.speciality);

  const location = [therapist.city, therapist.state]
    .filter(Boolean)
    .join(" - ");

  const experienceText =
    therapist.experience ?? "Experiência não informada";

  const bioText =
    therapist.bio ??
    "Profissional cadastrado no AuraMeets, com atendimento voltado ao cuidado, escuta e desenvolvimento humano.";

  const compatibility = therapist.verified ? 95 : 85;

  const normalizedName = normalizeText(therapist.name);
  const normalizedSlug = normalizeText(therapist.slug);

  const isOscar =
    normalizedName === "oscarahumada" ||
    normalizedSlug === "oscarahumada";

  const displayedPrice = isOscar
    ? "R$ 35,00"
    : therapist.price !== null
      ? therapist.price.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "Consultar";

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
                  {compatibility}% compatível
                </span>

                <span className="rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300">
                  {experienceText}
                </span>

                {therapist.verified && (
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
                    Perfil verificado
                  </span>
                )}

                {therapist.plan === "Fundador" && (
                  <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm font-bold text-yellow-300">
                    Terapeuta Fundador
                  </span>
                )}
              </div>

              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {therapist.name}
              </h1>

              <p className="mt-4 text-lg font-bold text-yellow-400 sm:text-xl">
                {specialities.join(" • ")}
              </p>

              <p className="mt-3 text-slate-400">
                {location || "Atendimento online"}
              </p>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                {bioText}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {isOscar ? (
                  <a
                    href={OSCAR_PAYMENT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-yellow-400 px-8 py-4 text-center text-lg font-black text-slate-950 transition hover:bg-yellow-300"
                  >
                    Comprar Mapa Numerológico — R$ 35,00
                  </a>
                ) : (
                  <Link
                    href={`/agendar/${therapist.slug}`}
                    className="rounded-xl bg-yellow-400 px-8 py-4 text-center text-lg font-black text-slate-950 transition hover:bg-yellow-300"
                  >
                    Agendar atendimento
                  </Link>
                )}

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
              {bioText}
            </p>

            <p className="mt-4 text-lg leading-8 text-slate-300">
              O atendimento busca compreender o momento de cada pessoa e
              oferecer um espaço de escuta, orientação e desenvolvimento.
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
              {specialities.map((speciality) => (
                <div
                  key={speciality}
                  className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5"
                >
                  <span className="font-bold text-yellow-400">✓</span>

                  <p className="mt-3 text-lg font-black text-white">
                    {speciality}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Informações de atendimento
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                <p className="text-sm font-bold text-slate-400">
                  Modalidade
                </p>

                <p className="mt-2 text-lg font-black text-white">
                  {therapist.service_type ?? "A combinar"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                <p className="text-sm font-bold text-slate-400">
                  Duração
                </p>

                <p className="mt-2 text-lg font-black text-white">
                  {therapist.duration ?? "A combinar"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                <p className="text-sm font-bold text-slate-400">
                  Valor
                </p>

                <p className="mt-2 text-lg font-black text-white">
                  {displayedPrice}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                <p className="text-sm font-bold text-slate-400">
                  Localização
                </p>

                <p className="mt-2 text-lg font-black text-white">
                  {location || "Atendimento online"}
                </p>
              </div>
            </div>
          </article>
        </div>

        <aside className="h-fit rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6 sm:p-8 lg:sticky lg:top-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
            Próximo passo
          </p>

          <h2 className="mt-4 text-2xl font-black">
            {isOscar
              ? "Adquira seu Mapa Numerológico Pessoal"
              : "Deseja conversar com este profissional?"}
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            {isOscar
              ? "Realize o pagamento com segurança e dê o primeiro passo para compreender os principais números da sua vida."
              : "Escolha um horário disponível e avance para o agendamento."}
          </p>

          {isOscar ? (
            <a
              href={OSCAR_PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Comprar por R$ 35,00
            </a>
          ) : (
            <Link
              href={`/agendar/${therapist.slug}`}
              className="mt-7 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Ver horários disponíveis
            </Link>
          )}

          {therapist.instagram && (
            <a
              href={therapist.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Ver Instagram
            </a>
          )}

          {therapist.website && (
            <a
              href={therapist.website}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Visitar site
            </a>
          )}

          <p className="mt-5 text-sm leading-6 text-slate-500">
            {isOscar
              ? "O pagamento será processado pela InfinitePay."
              : "O agendamento ainda será conectado à agenda real do profissional."}
          </p>
        </aside>
      </section>
    </main>
  );
}