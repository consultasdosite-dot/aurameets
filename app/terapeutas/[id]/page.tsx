import Link from "next/link";
import { notFound } from "next/navigation";

import { getTherapistBySlug } from "@/lib/therapists";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Offer = {
  id: number;
  title: string;
  offer_type: string | null;
  offer_price: number | string | null;
  active: boolean | null;
};

type Service = {
  id: string;
  therapist_id: string;
  name: string;
  category: string;
  description: string;
  cover_photo_url: string | null;
  online: boolean;
  in_person: boolean;
  duration_minutes: number;
  price: number | string;
  promotional_price: number | string | null;
  currency: string;
  status: "active" | "inactive" | "under_review";
  created_at: string;
};

async function getActiveOffersByTherapistId(
  therapistId: number,
): Promise<Offer[]> {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const query = new URLSearchParams({
    select: "id,title,offer_type,offer_price,active",
    therapist_id: `eq.${therapistId}`,
    active: "eq.true",
    order: "created_at.asc",
  });

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/offers?${query.toString()}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "Não foi possível carregar as ofertas públicas:",
        await response.text(),
      );

      return [];
    }

    return (await response.json()) as Offer[];
  } catch (error) {
    console.error(
      "Erro ao carregar ofertas públicas:",
      error,
    );

    return [];
  }
}

async function getActiveServicesByProfileId(
  profileId: string | null,
): Promise<Service[]> {
  if (!profileId) {
    return [];
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const query = new URLSearchParams({
    select:
      "id,therapist_id,name,category,description,cover_photo_url,online,in_person,duration_minutes,price,promotional_price,currency,status,created_at",
    therapist_id: `eq.${profileId}`,
    status: "eq.active",
    order: "created_at.desc",
  });

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/services?${query.toString()}`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "Não foi possível carregar os serviços públicos:",
        await response.text(),
      );

      return [];
    }

    return (await response.json()) as Service[];
  } catch (error) {
    console.error(
      "Erro ao carregar serviços públicos:",
      error,
    );

    return [];
  }
}

function normalizeText(
  value: string | null | undefined,
) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function formatCurrency(
  value: number | string | null,
  currency = "BRL",
) {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) {
    return "Consultar";
  }

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

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

function splitParagraphs(value: string) {
  return value
    .split(/\r?\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function isSessionService(service: Service) {
  const text = normalizeText(
    `${service.category} ${service.name}`,
  );

  return (
    text.includes("consulta") ||
    text.includes("sessao") ||
    text.includes("terapia") ||
    text.includes("atendimento")
  );
}

function isPackageOffer(offer: Offer) {
  return normalizeText(
    offer.offer_type,
  ).includes("pacote");
}

function ServiceCard({
  service,
  therapistSlug,
  buttonLabel,
}: {
  service: Service;
  therapistSlug: string;
  buttonLabel: string;
}) {
  const regularPrice = Number(service.price);

  const promotionalPrice =
    service.promotional_price !== null
      ? Number(service.promotional_price)
      : null;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-700 bg-[#111A33] transition hover:-translate-y-1 hover:border-yellow-400/50">
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[#1B2444]">
        {service.cover_photo_url ? (
          <img
            src={service.cover_photo_url}
            alt={`Imagem do serviço ${service.name}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="text-center">
            <div className="text-5xl">✦</div>

            <p className="mt-3 text-sm font-bold text-slate-400">
              Atendimento AuraMeets
            </p>
          </div>
        )}
      </div>

      <div className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
          {service.category}
        </p>

        <h3 className="mt-3 text-2xl font-black text-white">
          {service.name}
        </h3>

        <p className="mt-4 leading-7 text-slate-300">
          {service.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {service.online && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
              Online
            </span>
          )}

          {service.in_person && (
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
              Presencial
            </span>
          )}

          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
            {service.duration_minutes} minutos
          </span>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-5">
          {promotionalPrice !== null ? (
            <>
              <p className="text-sm font-semibold text-slate-500 line-through">
                {formatCurrency(
                  regularPrice,
                  service.currency,
                )}
              </p>

              <p className="mt-1 text-3xl font-black text-yellow-400">
                {formatCurrency(
                  promotionalPrice,
                  service.currency,
                )}
              </p>
            </>
          ) : (
            <p className="text-3xl font-black text-yellow-400">
              {formatCurrency(
                regularPrice,
                service.currency,
              )}
            </p>
          )}
        </div>

        <Link
          href={`/agendar/${therapistSlug}?servico=${service.id}`}
          className="mt-6 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
        >
          {buttonLabel}
        </Link>
      </div>
    </article>
  );
}

const OSCAR_PAYMENT_URL =
  "https://link.infinitepay.io/oscar_jose_ahumada_/Ri0x-hKKpl4Pa7W-800,00";

export default async function TherapistProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const therapist =
    await getTherapistBySlug(id);

  if (!therapist) {
    notFound();
  }

  const [activeOffers, activeServices] =
    await Promise.all([
      getActiveOffersByTherapistId(
        therapist.id,
      ),
      getActiveServicesByProfileId(
        therapist.profile_id,
      ),
    ]);

  const initials = getInitials(
    therapist.name,
  );

  const specialities =
    splitSpecialities(
      therapist.speciality,
    );

  const profilePhotoUrl =
    therapist.profile_photo_url?.trim() ||
    therapist.photo_url?.trim() ||
    null;

  const location = [
    therapist.city,
    therapist.state,
  ]
    .filter(Boolean)
    .join(" - ");

  const experienceText =
    therapist.experience ??
    "Experiência não informada";

  const bioText =
    therapist.bio ??
    "Profissional cadastrado no AuraMeets, com atendimento voltado ao cuidado, escuta e desenvolvimento humano.";

  const bioParagraphs =
    splitParagraphs(bioText);

  const compatibility =
    therapist.verified ? 95 : 85;

  const normalizedName =
    normalizeText(therapist.name);

  const normalizedSlug =
    normalizeText(therapist.slug);

  const isOscar =
    normalizedName === "oscarahumada" ||
    normalizedSlug.startsWith(
      "oscarahumada",
    );

  const sessionServices =
    activeServices.filter(
      isSessionService,
    );

  const otherServices =
    activeServices.filter(
      (service) =>
        !isSessionService(service),
    );

  const packageOffers =
    activeOffers.filter(
      isPackageOffer,
    );

  const otherOffers =
    activeOffers.filter(
      (offer) =>
        !isPackageOffer(offer),
    );

  const hasSessions =
    sessionServices.length > 0;

  const hasServices =
    otherServices.length > 0;

  const hasPackages =
    packageOffers.length > 0;

  return (
    <main className="min-h-screen bg-[#060B1A] text-white">
      <section className="border-b border-slate-800 bg-[#0B1224]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <Link
            href="/terapeutas"
            className="text-sm font-bold text-slate-400 transition hover:text-yellow-400"
          >
            ← Voltar aos terapeutas
          </Link>

          <div className="mt-9 grid gap-10 lg:grid-cols-[260px_1fr] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <div className="flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-2 border-yellow-400/50 bg-yellow-400/10 text-6xl font-black text-yellow-400 shadow-2xl">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={`Foto de ${therapist.name}`}
                    className="h-full w-full object-cover"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  initials
                )}
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

                {therapist.plan ===
                  "Fundador" && (
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
                {location ||
                  "Atendimento online"}
              </p>

              <div className="mt-6 max-w-3xl space-y-4">
                {bioParagraphs
                  .slice(0, 2)
                  .map(
                    (
                      paragraph,
                      index,
                    ) => (
                      <p
                        key={index}
                        className="text-lg leading-8 text-slate-300"
                      >
                        {paragraph}
                      </p>
                    ),
                  )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#atendimentos"
                  className="rounded-xl bg-yellow-400 px-7 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
                >
                  Escolher atendimento
                </a>

                {isOscar && (
                  <a
                    href={
                      OSCAR_PAYMENT_URL
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-yellow-400 px-7 py-4 text-center font-black text-yellow-400 transition hover:bg-yellow-400 hover:text-slate-950"
                  >
                    Mapa Numerológico —
                    R$ 800,00
                  </a>
                )}

                <Link
                  href="/terapeutas"
                  className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  Ver outros terapeutas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="atendimentos"
        className="border-b border-slate-800 bg-[#090F20]"
      >
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-400">
            Como você deseja começar?
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Escolha a experiência ideal para você
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            Conheça as opções disponíveis
            com este profissional e escolha
            aquela que melhor combina com
            seu momento.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {hasSessions && (
              <a
                href="#sessoes"
                className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 transition hover:border-yellow-400 hover:bg-yellow-400/15"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                  Atendimento
                </p>

                <p className="mt-2 text-xl font-black">
                  Sessões
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {sessionServices.length}{" "}
                  {sessionServices.length ===
                  1
                    ? "opção disponível"
                    : "opções disponíveis"}
                </p>
              </a>
            )}

            {hasServices && (
              <a
                href="#servicos"
                className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-5 transition hover:border-purple-300 hover:bg-purple-400/15"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-purple-300">
                  Experiências
                </p>

                <p className="mt-2 text-xl font-black">
                  Serviços
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {otherServices.length}{" "}
                  {otherServices.length ===
                  1
                    ? "opção disponível"
                    : "opções disponíveis"}
                </p>
              </a>
            )}

            {hasPackages && (
              <a
                href="#pacotes"
                className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5 transition hover:border-emerald-300 hover:bg-emerald-400/15"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                  Mais vantagens
                </p>

                <p className="mt-2 text-xl font-black">
                  Pacotes
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {packageOffers.length}{" "}
                  {packageOffers.length === 1
                    ? "pacote disponível"
                    : "pacotes disponíveis"}
                </p>
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_330px]">
        <div className="space-y-10">
          {hasSessions && (
            <section id="sessoes">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
                  Sessões
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Atendimentos individuais
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  Escolha uma sessão e
                  solicite seu atendimento
                  diretamente com o
                  profissional.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {sessionServices.map(
                  (service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      therapistSlug={
                        therapist.slug
                      }
                      buttonLabel="Agendar sessão"
                    />
                  ),
                )}
              </div>
            </section>
          )}

          {hasServices && (
            <section id="servicos">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-300">
                  Serviços
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Experiências e entregas
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  Serviços personalizados
                  desenvolvidos para
                  diferentes necessidades e
                  momentos.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {otherServices.map(
                  (service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      therapistSlug={
                        therapist.slug
                      }
                      buttonLabel="Quero este serviço"
                    />
                  ),
                )}
              </div>
            </section>
          )}

          {hasPackages && (
            <section id="pacotes">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
                  Pacotes
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Acompanhamentos especiais
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  Opções para quem deseja
                  aprofundar o processo e
                  realizar mais de um
                  atendimento.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {packageOffers.map(
                  (offer) => (
                    <article
                      key={offer.id}
                      className="rounded-3xl border border-emerald-400/30 bg-emerald-400/5 p-6"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                        Pacote
                      </p>

                      <h3 className="mt-3 text-2xl font-black">
                        {offer.title}
                      </h3>

                      {offer.offer_price !==
                        null && (
                        <p className="mt-5 text-3xl font-black text-yellow-400">
                          {formatCurrency(
                            offer.offer_price,
                          )}
                        </p>
                      )}

                      <Link
                        href={`/agendar/${therapist.slug}?oferta=${offer.id}`}
                        className="mt-6 block rounded-xl bg-emerald-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-emerald-300"
                      >
                        Escolher pacote
                      </Link>
                    </article>
                  ),
                )}
              </div>
            </section>
          )}

          {otherOffers.length > 0 && (
            <section>
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
                  Oportunidades
                </p>

                <h2 className="mt-3 text-3xl font-black">
                  Ofertas disponíveis
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {otherOffers.map(
                  (offer) => (
                    <article
                      key={offer.id}
                      className="rounded-3xl border border-yellow-400/25 bg-yellow-400/5 p-6"
                    >
                      <h3 className="text-2xl font-black">
                        {offer.title}
                      </h3>

                      {offer.offer_price !==
                        null && (
                        <p className="mt-4 text-3xl font-black text-yellow-400">
                          {formatCurrency(
                            offer.offer_price,
                          )}
                        </p>
                      )}

                      <Link
                        href={`/agendar/${therapist.slug}?oferta=${offer.id}`}
                        className="mt-6 block rounded-xl border border-yellow-400 px-6 py-4 text-center font-black text-yellow-400 transition hover:bg-yellow-400 hover:text-slate-950"
                      >
                        Ver opção
                      </Link>
                    </article>
                  ),
                )}
              </div>
            </section>
          )}

          <section className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Sobre o profissional
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Conheça melhor{" "}
              {therapist.name}
            </h2>

            <div className="mt-7 max-w-3xl space-y-6">
              {bioParagraphs.map(
                (paragraph, index) => (
                  <p
                    key={index}
                    className="text-lg leading-8 text-slate-300"
                  >
                    {paragraph}
                  </p>
                ),
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Especialidades
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Como este profissional pode ajudar
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {specialities.map(
                (speciality) => (
                  <div
                    key={speciality}
                    className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5"
                  >
                    <span className="font-bold text-yellow-400">
                      ✓
                    </span>

                    <p className="mt-3 text-lg font-black">
                      {speciality}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6 lg:sticky lg:top-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
            Próximo passo
          </p>

          <h2 className="mt-4 text-2xl font-black">
            Encontre o atendimento ideal
          </h2>

          <p className="mt-4 leading-7 text-slate-300">
            Escolha entre as opções
            disponíveis ou solicite um
            horário diretamente ao
            profissional.
          </p>

          <a
            href="#atendimentos"
            className="mt-7 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
          >
            Ver atendimentos
          </a>

          <Link
            href={`/agendar/${therapist.slug}`}
            className="mt-3 block rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Solicitar horário
          </Link>

          {isOscar && (
            <a
              href={OSCAR_PAYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-xl border border-yellow-400 px-6 py-4 text-center font-black text-yellow-400 transition hover:bg-yellow-400 hover:text-slate-950"
            >
              Mapa Numerológico
              <span className="mt-1 block text-sm">
                R$ 800,00
              </span>
            </a>
          )}

          {therapist.instagram && (
            <a
              href={therapist.instagram}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Ver Instagram
            </a>
          )}

          {therapist.website && (
            <a
              href={therapist.website}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Visitar site
            </a>
          )}

          <div className="mt-6 border-t border-yellow-400/15 pt-5">
            <p className="text-sm leading-6 text-slate-400">
              Atendimento realizado
              diretamente com o
              profissional cadastrado no
              AuraMeets.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}