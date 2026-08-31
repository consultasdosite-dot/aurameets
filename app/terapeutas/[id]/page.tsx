import Link from "next/link";
import { notFound } from "next/navigation";

import ExpandableBio from "./ExpandableBio";

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
  phone: string | null;
  promotion_active: boolean | null;
  promotion_title: string | null;
  promotion_description: string | null;
  promotion_price: number | string | null;
  promotion_url: string | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
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
  const { supabaseUrl, supabasePublicKey } = getSupabasePublicConfig();

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

  const { supabaseUrl, supabasePublicKey } = getSupabasePublicConfig();

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
  const { supabaseUrl, supabasePublicKey } = getSupabasePublicConfig();

  const emptyValue: PublicProfileExtra = {
    profile_id: null,
    presentation_video_url: null,
    professional_headline: null,
    phone: null,
    promotion_active: false,
    promotion_title: null,
    promotion_description: null,
    promotion_price: null,
    promotion_url: null,
    promotion_starts_at: null,
    promotion_ends_at: null,
  };

  if (!supabaseUrl || !supabasePublicKey) {
    return emptyValue;
  }

  const query = new URLSearchParams({
    select:
      "profile_id,presentation_video_url,professional_headline,phone,promotion_active,promotion_title,promotion_description,promotion_price,promotion_url,promotion_starts_at,promotion_ends_at",
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
    return [];
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

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
      <path d="M8 13h2M14 13h2M8 17h2M14 17h2" />
    </svg>
  );
}

function LotusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.65">
      <path d="M12 20c-3.8-2.1-6-5-6-8.1C8.6 12 10.6 13 12 15c1.4-2 3.4-3 6-3.1 0 3.1-2.2 6-6 8.1Z" />
      <path d="M12 15c-2.5-2.3-3.2-5-2.1-8 1.1.7 1.8 1.7 2.1 3 .3-1.3 1-2.3 2.1-3 1.1 3 .4 5.7-2.1 8Z" />
      <path d="M6 12c-1.8-.2-3.2.1-4 .8 1.3 3.2 4.6 5.7 10 7.2M18 12c1.8-.2 3.2.1 4 .8-1.3 3.2-4.6 5.7-10 7.2" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L20 8H6" />
      <circle cx="9" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.2 2.3 3.3 5.3 3.3 9S14.2 18.7 12 21c-2.2-2.3-3.3-5.3-3.3-9S9.8 5.3 12 3Z" />
    </svg>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const regularPrice = Number(service.price);
  const finalPrice = getServiceFinalPrice(service);
  const hasPromotion =
    service.promotional_price !== null &&
    Number.isFinite(Number(service.promotional_price));

  return (
    <article className="overflow-hidden rounded-[26px] border border-[#eee8f2] bg-white shadow-[0_14px_40px_rgba(76,42,87,0.08)]">
      {service.cover_photo_url && (
        <div className="aspect-[16/8] w-full overflow-hidden bg-[#f7f3fa]">
          <img
            src={service.cover_photo_url}
            alt={`Imagem do serviço ${service.name}`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-5 sm:p-7">
        {service.category && (
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#7a376f]">
            {service.category}
          </p>
        )}

        <h3 className="mt-2 text-xl font-black text-[#25252c] sm:text-2xl">
          {service.name}
        </h3>

        {service.description && (
          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#5f626b] sm:text-base sm:leading-7">
            {service.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {service.online && (
            <span className="rounded-full bg-[#f8f3fa] px-3 py-1.5 text-xs font-bold text-[#6c3869]">
              Online
            </span>
          )}
          {service.in_person && (
            <span className="rounded-full bg-[#f8f3fa] px-3 py-1.5 text-xs font-bold text-[#6c3869]">
              Presencial
            </span>
          )}
          {service.duration_minutes > 0 && (
            <span className="rounded-full bg-[#f8f3fa] px-3 py-1.5 text-xs font-bold text-[#6c3869]">
              {service.duration_minutes} min
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-[#f0ebf2] pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {hasPromotion && (
              <p className="text-sm font-semibold text-[#9a929c] line-through">
                {formatCurrency(regularPrice, service.currency)}
              </p>
            )}
            <p className="mt-1 text-2xl font-black text-[#b98221]">
              {formatCurrency(finalPrice, service.currency)}
            </p>
          </div>

          <Link
            href={`/comprar?servico=${encodeURIComponent(service.id)}`}
            className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-[#7b2f72] px-6 py-3 text-center text-sm font-black text-white transition hover:brightness-105"
          >
            QUERO COMPRAR
          </Link>
        </div>
      </div>
    </article>
  );
}

function AuraMeetsTopbar() {
  return (
    <header className="bg-white">
      <div className="mx-auto flex min-h-[78px] max-w-6xl items-center justify-between px-5 sm:min-h-[94px] sm:px-8">
        <div className="flex h-10 w-10 items-center justify-start text-[#22242a] lg:hidden" aria-hidden="true">
          <span className="text-3xl leading-none">☰</span>
        </div>

        <Link href="/" className="text-center sm:text-left">
          <div className="text-[25px] font-black tracking-[0.02em] sm:text-[31px]">
            <span className="text-[#7e2f73]">AURA</span>
            <span className="text-[#26324a]">MEETS</span>
          </div>
          <div className="mt-[-2px] text-[8px] font-bold uppercase tracking-[0.34em] text-[#be9138] sm:text-[9px]">
            Conecta • Transforma • Realiza
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-xs font-black uppercase tracking-[0.02em] text-[#3f4a61] lg:flex">
          <Link href="/terapeutas" className="transition hover:text-[#7b2f72]">
            Terapeutas
          </Link>
          <a href="#servicos" className="transition hover:text-[#7b2f72]">
            Serviços
          </a>
          <Link href="/sobre" className="transition hover:text-[#7b2f72]">
            Sobre nós
          </Link>
          <Link
            href="/presentear"
            className="rounded-full bg-[#7d24ee] px-6 py-3 text-white transition hover:brightness-105"
          >
            Quero presentear
          </Link>
        </nav>

        <div className="flex w-10 items-center justify-end text-2xl text-[#22242a] lg:hidden" aria-hidden="true">
          ♡
        </div>
      </div>
    </header>
  );
}

export default async function TherapistProfilePage({ params }: PageProps) {
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

  const location = [therapist.city, therapist.state]
    .filter(Boolean)
    .join(" - ");

  const bioText = therapist.bio?.trim() || "";
  const bioParagraphs = splitParagraphs(bioText);

  const featuredService = activeServices[0] ?? null;
  const hasOnline = activeServices.some((service) => service.online);
  const hasInPerson = activeServices.some((service) => service.in_person);

  const attendanceText = hasOnline && hasInPerson
    ? "Atendimento online e presencial"
    : hasOnline
      ? "Atendimento online"
      : hasInPerson
        ? "Atendimento presencial"
        : "";

  const whatsappNumber = (profileExtra.phone ?? "").replace(/\D/g, "");
  const whatsappMessage = featuredService
    ? `Olá, ${therapist.name}! Vi seu perfil no AuraMeets e quero comprar ou saber mais sobre ${featuredService.name}.`
    : `Olá, ${therapist.name}! Vi seu perfil no AuraMeets e quero conhecer seus atendimentos.`;
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const scheduleMessage = `Olá, ${therapist.name}! Vi seu perfil no AuraMeets e gostaria de agendar um atendimento.`;
  const scheduleHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(scheduleMessage)}`
    : null;

  const servicesHref = "#servicos";
  const featuredPurchaseHref = featuredService
    ? `/comprar?servico=${encodeURIComponent(featuredService.id)}`
    : servicesHref;

  const now = new Date();
  const startsAt = profileExtra.promotion_starts_at
    ? new Date(profileExtra.promotion_starts_at)
    : null;
  const endsAt = profileExtra.promotion_ends_at
    ? new Date(profileExtra.promotion_ends_at)
    : null;
  const promotionIsInPeriod =
    (!startsAt || startsAt <= now) && (!endsAt || endsAt >= now);
  const hasActivePromotion =
    Boolean(profileExtra.promotion_active) && promotionIsInPeriod;
  const promotionHref =
    profileExtra.promotion_url?.trim() || `/promocao/${therapist.slug}`;

  return (
    <main className="min-h-screen bg-[#fdfdfd] text-[#24262b]">
      <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-8 sm:pt-6">
        <header className="overflow-hidden rounded-[24px] bg-[#5B1F61] shadow-[0_10px_28px_rgba(66,31,72,0.14)]">
          <div className="flex min-h-[96px] items-center justify-between gap-5 px-6 py-4 sm:min-h-[104px] sm:px-8 lg:px-10">
            <Link href="/" className="shrink-0" aria-label="AuraMeets - início">
              <div className="text-[24px] font-black tracking-[0.02em] text-white sm:text-[30px]">
                AURA<span className="text-[#E0B24A]">MEETS</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-7 text-xs font-black uppercase tracking-[0.03em] text-white lg:flex">
              <Link href="/terapeutas" className="transition hover:text-[#F1D58A]">
                Terapeutas
              </Link>
              <a href="#servicos" className="transition hover:text-[#F1D58A]">
                Serviços
              </a>
              <Link
                href="/presentear"
                className="rounded-full border border-white/75 px-6 py-3 text-white transition hover:bg-white hover:text-[#5B1F61]"
              >
                Presentear
              </Link>
            </nav>

            <Link
              href="/terapeutas"
              className="rounded-full border border-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.04em] text-white lg:hidden"
            >
              Perfis
            </Link>
          </div>
        </header>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        <div className="relative mt-6 sm:mt-8">
          <div className="grid gap-5 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center lg:grid-cols-[144px_minmax(0,1fr)]">
            <div className="relative mx-auto sm:mx-0">
              <div className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full border-[7px] border-white bg-[#f2eef5] shadow-[0_12px_32px_rgba(76,42,87,0.14)] sm:h-[128px] sm:w-[128px] lg:h-[140px] lg:w-[140px]">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={`Foto de ${therapist.name}`}
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-3xl font-black text-[#7c6f80] sm:text-4xl">
                    {initials}
                  </span>
                )}
              </div>

              {therapist.verified && (
                <div className="absolute bottom-1 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#7b2f72] text-lg font-black text-white shadow-lg sm:h-11 sm:w-11">
                  ✓
                </div>
              )}
            </div>

            <div className="pb-1 text-center sm:pb-0 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <h1 className="text-3xl font-black tracking-[-0.02em] text-[#202126] sm:text-4xl lg:text-[42px]">
                  {therapist.name}
                </h1>

                {therapist.verified && (
                  <span className="rounded-full bg-[#fbf7ef] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.04em] text-[#4f4a46]">
                    Profissional verificado
                  </span>
                )}
              </div>

              {(profileExtra.professional_headline?.trim() || specialities.length > 0) && (
                <p className="mt-2 text-lg font-bold text-[#78306f] sm:text-xl">
                  {profileExtra.professional_headline?.trim() || specialities.join(" • ")}
                </p>
              )}

              {(location || attendanceText) && (
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[#4d5057] sm:justify-start sm:text-base">
                  {location && (
                    <span className="inline-flex items-center gap-2">
                      <LocationIcon />
                      {location}
                    </span>
                  )}

                  {attendanceText && (
                    <span className="inline-flex items-center gap-2">
                      <GlobeIcon />
                      {attendanceText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {bioParagraphs.length > 0 && (
            <ExpandableBio paragraphs={bioParagraphs} />
          )}

          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            {scheduleHref ? (
              <a
                href={scheduleHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-[18px] bg-gradient-to-br from-[#682b67] to-[#8b3c79] px-3 py-4 text-center text-white shadow-[0_10px_24px_rgba(123,47,114,0.18)] transition hover:-translate-y-0.5"
              >
                <CalendarIcon />
                <span className="text-xs font-black sm:text-sm">QUERO AGENDAR</span>
              </a>
            ) : (
              <div className="flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-[18px] border border-[#d8c7da] bg-[#faf7fb] px-3 py-4 text-center text-[#8c7a8b]">
                <CalendarIcon />
                <span className="text-xs font-black sm:text-sm">QUERO AGENDAR</span>
              </div>
            )}

            <a
              href={servicesHref}
              className="flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-[18px] border border-[#7b2f72] bg-white px-3 py-4 text-center text-[#7b2f72] transition hover:bg-[#faf5fb]"
            >
              <LotusIcon />
              <span className="text-xs font-black sm:text-sm">MAIS SERVIÇOS</span>
            </a>

            <Link
              href={featuredPurchaseHref}
              className="flex min-h-[112px] flex-col items-center justify-center gap-3 rounded-[18px] bg-gradient-to-br from-[#d6a134] to-[#e7b742] px-3 py-4 text-center text-white shadow-[0_10px_24px_rgba(214,161,52,0.2)] transition hover:-translate-y-0.5"
            >
              <CartIcon />
              <span className="text-xs font-black sm:text-sm">QUERO COMPRAR</span>
            </Link>
          </div>

          {hasActivePromotion && profileExtra.promotion_title && (
            <div className="mt-5 rounded-2xl border border-[#eadbc0] bg-[#fffaf0] p-4 text-center sm:text-left">
              <p className="font-bold text-[#6c4d1c]">
                {profileExtra.promotion_title}
              </p>
              {profileExtra.promotion_description && (
                <p className="mt-1 text-sm leading-6 text-[#765f3d]">
                  {profileExtra.promotion_description}
                </p>
              )}
              <Link
                href={promotionHref}
                className="mt-3 inline-flex rounded-full bg-[#d6a134] px-5 py-2 text-sm font-black text-white"
              >
                VER OFERTA
              </Link>
            </div>
          )}
        </div>
      </section>

      {specialities.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-black text-[#26272d] sm:text-3xl">
              Especialidades
            </h2>
            <span className="text-sm font-semibold text-[#65666d]">
              {specialities.length} {specialities.length === 1 ? "especialidade" : "especialidades"}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {specialities.map((speciality) => (
              <span
                key={speciality}
                className="rounded-full bg-[#f8f2f8] px-4 py-2.5 text-sm font-bold text-[#73366c]"
              >
                {speciality}
              </span>
            ))}
          </div>
        </section>
      )}

      <section
        id="servicos"
        className="mx-auto max-w-6xl scroll-mt-6 px-5 py-10 sm:px-8 sm:py-12"
      >
        <div className="mb-7">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8a4d82]">
            Atendimentos e serviços
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#26272d] sm:text-3xl">
            Serviços disponíveis
          </h2>
        </div>

        {activeServices.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {activeServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#d9d0dc] bg-[#fbf9fc] p-7 text-center text-[#737078]">
            Este profissional ainda não publicou serviços.
          </div>
        )}
      </section>

      {activeOffers.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8 sm:pb-12">
          <div className="rounded-[26px] bg-[#faf6ed] p-6 sm:p-8">
            <h2 className="text-2xl font-black text-[#2d2a25]">Ofertas</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {activeOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-2xl border border-[#eadfc9] bg-white p-4"
                >
                  <p className="font-bold text-[#35312b]">{offer.title}</p>
                  {offer.offer_price !== null && (
                    <p className="mt-1 text-lg font-black text-[#b37c21]">
                      {formatCurrency(offer.offer_price)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {whatsappHref && (
        <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 rounded-[26px] border border-[#eee7ef] bg-white p-6 text-center shadow-[0_12px_34px_rgba(76,42,87,0.06)] sm:flex-row sm:text-left">
            <div>
              <p className="text-xl font-black text-[#292a2f]">
                Quer falar com este profissional?
              </p>
              <p className="mt-1 text-sm text-[#70727a]">
                Entre em contato diretamente pelo WhatsApp.
              </p>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-2xl bg-[#7b2f72] px-6 py-4 text-center text-sm font-black text-white sm:w-auto"
            >
              FALAR NO WHATSAPP
            </a>
          </div>
        </section>
      )}
    </main>
  );
}