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

type PublicProfileExtra = {
  profile_id: string | null;
  presentation_video_url: string | null;
  professional_headline: string | null;
};

function getSupabasePublicConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    supabaseUrl,
    supabasePublicKey,
  };
}

async function getActiveOffersByTherapistId(
  therapistId: number,
): Promise<Offer[]> {
  const { supabaseUrl, supabasePublicKey } =
    getSupabasePublicConfig();

  if (!supabaseUrl || !supabasePublicKey) {
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
          apikey: supabasePublicKey,
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
    console.error("Erro ao carregar ofertas públicas:", error);
    return [];
  }
}

async function getActiveServicesByProfileId(
  profileId: string | null,
): Promise<Service[]> {
  if (!profileId) {
    return [];
  }

  const { supabaseUrl, supabasePublicKey } =
    getSupabasePublicConfig();

  if (!supabaseUrl || !supabasePublicKey) {
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
          apikey: supabasePublicKey,
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
    console.error("Erro ao carregar serviços públicos:", error);
    return [];
  }
}

async function getPublicProfileExtra(
  slug: string,
): Promise<PublicProfileExtra> {
  const { supabaseUrl, supabasePublicKey } =
    getSupabasePublicConfig();

  const emptyValue: PublicProfileExtra = {
    profile_id: null,
    presentation_video_url: null,
    professional_headline: null,
  };

  if (!supabaseUrl || !supabasePublicKey) {
    return emptyValue;
  }

  const query = new URLSearchParams({
    select: "profile_id,presentation_video_url,professional_headline",
    slug: `eq.${slug}`,
    active: "eq.true",
    limit: "1",
  });

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/therapists?${query.toString()}`,
      {
        headers: {
          apikey: supabasePublicKey,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error(
        "Não foi possível carregar os dados extras do perfil:",
        await response.text(),
      );
      return emptyValue;
    }

    const data = (await response.json()) as PublicProfileExtra[];
    return data[0] ?? emptyValue;
  } catch (error) {
    console.error("Erro ao carregar dados extras do perfil:", error);
    return emptyValue;
  }
}

function normalizeText(value: string | null | undefined) {
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

function getServiceFinalPrice(service: Service) {
  const promotionalPrice =
    service.promotional_price !== null
      ? Number(service.promotional_price)
      : null;

  if (
    promotionalPrice !== null &&
    Number.isFinite(promotionalPrice)
  ) {
    return promotionalPrice;
  }

  return Number(service.price);
}

function ServiceCard({
  service,
  therapistSlug,
}: {
  service: Service;
  therapistSlug: string;
}) {
  const regularPrice = Number(service.price);
  const finalPrice = getServiceFinalPrice(service);
  const hasPromotion =
    service.promotional_price !== null &&
    Number.isFinite(Number(service.promotional_price));

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-800 bg-[#10182D] shadow-xl transition hover:-translate-y-1 hover:border-yellow-400/40">
      <div className="relative h-48 overflow-hidden bg-[#18223D]">
        {service.cover_photo_url ? (
          <img
            src={service.cover_photo_url}
            alt={`Imagem do serviço ${service.name}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="text-4xl text-yellow-400">✦</div>
              <p className="mt-3 text-sm font-bold text-slate-400">
                Serviço AuraMeets
              </p>
            </div>
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

        <p className="mt-3 line-clamp-3 leading-7 text-slate-300">
          {service.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {service.online && (
            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-bold text-slate-300">
              Online
            </span>
          )}
          {service.in_person && (
            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-bold text-slate-300">
              Presencial
            </span>
          )}
          {service.duration_minutes > 0 && (
            <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-bold text-slate-300">
              {service.duration_minutes} min
            </span>
          )}
        </div>

        <div className="mt-6 border-t border-slate-800 pt-5">
          {hasPromotion && (
            <p className="text-sm font-semibold text-slate-500 line-through">
              {formatCurrency(regularPrice, service.currency)}
            </p>
          )}

          <p className="mt-1 text-3xl font-black text-yellow-400">
            {formatCurrency(finalPrice, service.currency)}
          </p>
        </div>

        <Link
          href={`/agendar/${therapistSlug}?servico=${service.id}`}
          className="mt-6 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
        >
          QUERO COMPRAR
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

  const therapist = await getTherapistBySlug(id);

  if (!therapist) {
    notFound();
  }

  const profileExtra = await getPublicProfileExtra(therapist.slug);

  const [activeOffers, activeServices] = await Promise.all([
    getActiveOffersByTherapistId(therapist.id),
    getActiveServicesByProfileId(profileExtra.profile_id),
  ]);

  const initials = getInitials(therapist.name);
  const specialities = splitSpecialities(therapist.speciality);

  const profilePhotoUrl =
    therapist.profile_photo_url?.trim() ||
    therapist.photo_url?.trim() ||
    null;

  const presentationVideoUrl =
    profileExtra.presentation_video_url?.trim() || null;

  const location = [therapist.city, therapist.state]
    .filter(Boolean)
    .join(" - ");

  const bioText =
    therapist.bio ??
    "Profissional cadastrado no AuraMeets, com atendimento voltado ao cuidado, escuta e desenvolvimento humano.";

  const bioParagraphs = splitParagraphs(bioText);
  const shortBio = bioParagraphs.slice(0, 2);

  const normalizedName = normalizeText(therapist.name);
  const normalizedSlug = normalizeText(therapist.slug);

  const isOscar =
    normalizedName === "oscarahumada" ||
    normalizedSlug.startsWith("oscarahumada");

  const featuredService =
    activeServices.find((service) => {
      const serviceName = normalizeText(service.name);
      return isOscar && serviceName.includes("mapanumerologico");
    }) ?? activeServices[0] ?? null;

  const remainingServices = featuredService
    ? activeServices.filter(
        (service) => service.id !== featuredService.id,
      )
    : activeServices;

  const specialOffer = activeOffers[0] ?? null;

  const featuredRegularPrice = featuredService
    ? Number(featuredService.price)
    : null;

  const featuredFinalPrice = featuredService
    ? getServiceFinalPrice(featuredService)
    : null;

  const featuredHasPromotion =
    featuredService?.promotional_price !== null &&
    featuredService?.promotional_price !== undefined &&
    Number.isFinite(Number(featuredService.promotional_price));

  const primaryPurchaseHref =
    isOscar && featuredService
      ? OSCAR_PAYMENT_URL
      : featuredService
        ? `/agendar/${therapist.slug}?servico=${featuredService.id}`
        : `/agendar/${therapist.slug}`;

  const primaryPurchaseExternal =
    isOscar && Boolean(featuredService);

  return (
    <main className="min-h-screen bg-[#060B1A] text-white">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.08),_transparent_34%),#0B1224]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
          <Link
            href="/terapeutas"
            className="text-sm font-bold text-slate-400 transition hover:text-yellow-400"
          >
            ← Voltar aos profissionais
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-stretch">
            <div className="overflow-hidden rounded-[32px] border border-slate-700 bg-[#111A33] shadow-2xl">
              <div className="relative aspect-[4/5] bg-[#17213A]">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={`Foto de ${therapist.name}`}
                    className="h-full w-full object-cover"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-7xl font-black text-yellow-400">
                    {initials}
                  </div>
                )}

                {therapist.verified && (
                  <div className="absolute left-5 top-5 rounded-full border border-emerald-400/40 bg-[#07131D]/90 px-4 py-2 text-xs font-black text-emerald-300 backdrop-blur">
                    ✓ Perfil verificado
                  </div>
                )}
              </div>

              {presentationVideoUrl && (
                <details className="border-t border-slate-800 bg-[#0D152A]">
                  <summary className="cursor-pointer list-none px-6 py-5 text-center font-black text-yellow-400 transition hover:bg-yellow-400/5">
                    ▶ ASSISTIR APRESENTAÇÃO
                  </summary>

                  <div className="border-t border-slate-800 p-4">
                    <video
                      controls
                      preload="metadata"
                      className="w-full rounded-2xl bg-black"
                    >
                      <source src={presentationVideoUrl} />
                      Seu navegador não conseguiu reproduzir este vídeo.
                    </video>
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-col rounded-[32px] border border-slate-800 bg-[#0E172B]/80 p-6 shadow-2xl backdrop-blur sm:p-8 lg:p-10">
              <div className="flex flex-wrap gap-2">
                {therapist.plan === "Fundador" && (
                  <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-black text-yellow-300">
                    Terapeuta Fundador
                  </span>
                )}

                <span className="rounded-full border border-slate-700 bg-slate-950/40 px-4 py-2 text-xs font-bold text-slate-300">
                  {location || "Atendimento online"}
                </span>
              </div>

              <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {therapist.name}
              </h1>

              <p className="mt-4 text-lg font-black text-yellow-400 sm:text-xl">
                {profileExtra.professional_headline?.trim() ||
                  specialities.join(" • ")}
              </p>

              <div className="mt-5 max-w-3xl space-y-3">
                {shortBio.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-base leading-7 text-slate-300 sm:text-lg sm:leading-8"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/agendar/${therapist.slug}`}
                  className="rounded-xl border border-slate-600 px-6 py-4 text-center font-black text-white transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  SOLICITAR ATENDIMENTO
                </Link>

                {therapist.instagram && (
                  <a
                    href={therapist.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-slate-300 transition hover:border-yellow-400 hover:text-yellow-400"
                  >
                    INSTAGRAM
                  </a>
                )}
              </div>

              <div className="mt-8 rounded-[28px] border border-yellow-400/30 bg-[linear-gradient(135deg,rgba(250,204,21,0.11),rgba(168,85,247,0.08))] p-6 sm:p-7">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                      Serviço em destaque
                    </p>

                    <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                      {featuredService?.name ||
                        "Atendimento personalizado"}
                    </h2>

                    {featuredService?.description && (
                      <p className="mt-3 line-clamp-3 leading-7 text-slate-300">
                        {featuredService.description}
                      </p>
                    )}
                  </div>

                  <div className="min-w-[210px] xl:text-right">
                    {featuredService &&
                      featuredHasPromotion &&
                      featuredRegularPrice !== null && (
                        <p className="text-sm font-semibold text-slate-500 line-through">
                          {formatCurrency(
                            featuredRegularPrice,
                            featuredService.currency,
                          )}
                        </p>
                      )}

                    {featuredService &&
                      featuredFinalPrice !== null && (
                        <p className="mt-1 text-3xl font-black text-yellow-400">
                          {formatCurrency(
                            featuredFinalPrice,
                            featuredService.currency,
                          )}
                        </p>
                      )}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {primaryPurchaseExternal ? (
                    <a
                      href={primaryPurchaseHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
                    >
                      QUERO COMPRAR
                    </a>
                  ) : (
                    <Link
                      href={primaryPurchaseHref}
                      className="rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
                    >
                      QUERO COMPRAR
                    </Link>
                  )}

                  {specialOffer && (
                    <Link
                      href={`/agendar/${therapist.slug}?oferta=${specialOffer.id}`}
                      className="rounded-xl border border-purple-400 bg-purple-400/10 px-6 py-4 text-center font-black text-purple-200 transition hover:bg-purple-400 hover:text-slate-950"
                    >
                      PROMOÇÃO ESPECIAL
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Atendimentos e serviços
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Escolha o que faz sentido para você
            </h2>
          </div>

          <p className="max-w-xl leading-7 text-slate-400 sm:text-right">
            Conheça as opções disponíveis e siga diretamente para a solicitação ou compra.
          </p>
        </div>

        {remainingServices.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {remainingServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                therapistSlug={therapist.slug}
              />
            ))}
          </div>
        ) : featuredService ? (
          <div className="rounded-3xl border border-slate-800 bg-[#10182D] p-6 text-slate-300">
            O serviço principal está destacado acima.
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-[#10182D] p-8 text-center">
            <p className="text-lg font-bold text-slate-300">
              Este profissional ainda não publicou serviços.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-slate-800 bg-[#090F20]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-[28px] border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Sobre
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Conheça {therapist.name}
            </h2>

            <div className="mt-6 space-y-5">
              {bioParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-lg leading-8 text-slate-300"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
              Especialidades
            </p>

            <h2 className="mt-4 text-3xl font-black">
              Áreas de atuação
            </h2>

            <div className="mt-6 flex flex-wrap gap-3">
              {specialities.map((speciality) => (
                <span
                  key={speciality}
                  className="rounded-full border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 font-bold text-slate-200"
                >
                  {speciality}
                </span>
              ))}
            </div>

            <Link
              href={`/agendar/${therapist.slug}`}
              className="mt-8 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300"
            >
              FALAR COM O PROFISSIONAL
            </Link>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 rounded-[28px] border border-yellow-400/20 bg-yellow-400/5 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xl font-black">
              Este profissional fez sentido para você?
            </p>
            <p className="mt-2 text-slate-400">
              Envie uma solicitação e combine os próximos passos diretamente.
            </p>
          </div>

          <Link
            href={`/agendar/${therapist.slug}`}
            className="w-full rounded-xl bg-yellow-400 px-7 py-4 text-center font-black text-slate-950 transition hover:bg-yellow-300 sm:w-auto"
          >
            SOLICITAR ATENDIMENTO
          </Link>
        </div>
      </section>
    </main>
  );
}