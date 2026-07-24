import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOfferById,
  getOfferBySlug,
  getTherapistInitials,
  type FeaturedOffer,
} from "../../../lib/offers";

type OfferPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function findOffer(slug: string): Promise<FeaturedOffer | null> {
  const decodedSlug = decodeURIComponent(slug).trim();

  if (!decodedSlug) {
    return null;
  }

  const offerBySlug = await getOfferBySlug(decodedSlug);

  if (offerBySlug) {
    return offerBySlug;
  }

  const numericId = Number(decodedSlug);

  if (Number.isInteger(numericId) && numericId > 0) {
    return getOfferById(numericId);
  }

  return null;
}

export async function generateMetadata({
  params,
}: OfferPageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = await findOffer(slug);

  if (!offer) {
    return {
      title: "Experiência não encontrada | AuraMeets",
      description:
        "A experiência que você procurou não está disponível no momento.",
    };
  }

  const description =
    offer.description?.trim() ||
    offer.subtitle?.trim() ||
    `Conheça esta experiência oferecida por ${offer.therapist_name} na AuraMeets.`;

  return {
    title: `${offer.title} | AuraMeets`,
    description,
    openGraph: {
      title: offer.title,
      description,
      type: "website",
      images: offer.therapist_photo_url
        ? [
            {
              url: offer.therapist_photo_url,
              alt: offer.therapist_name,
            },
          ]
        : undefined,
    },
  };
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = await findOffer(slug);
console.log("OFFER:", offer);
  if (!offer) {
    notFound();
  }

  const initials = getTherapistInitials(offer.therapist_name);

  const bookingHref = offer.therapist_slug
  ? `/agendar/${offer.therapist_slug}?oferta=${offer.id}`
  : "/terapeutas";

  const therapistHref = offer.therapist_slug
    ? `/terapeuta/${offer.therapist_slug}`
    : "/terapeutas";

  return (
    <main className="min-h-screen bg-[#fbf9fd] text-[#101d3b]">
      <OfferHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#24103c] via-[#4d2575] to-[#7d45b5]">
        <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-[#b58ad8]/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#f0c987]/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pb-24 lg:pt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/80 transition hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar para a página inicial
          </Link>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="relative mx-auto w-full max-w-[480px]">
              <div className="absolute -inset-4 rounded-[40px] bg-white/10 blur-sm" />

              <div className="relative overflow-hidden rounded-[34px] border border-white/20 bg-[#3c2056] shadow-[0_30px_80px_rgba(14,5,26,0.4)]">
                <div className="aspect-[4/5]">
                  {offer.therapist_photo_url ? (
                    <img
                      src={offer.therapist_photo_url}
                      alt={offer.therapist_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#8d59bb] to-[#4b236d]">
                      <span className="text-7xl font-black text-white">
                        {initials}
                      </span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#160b25] via-[#160b25]/75 to-transparent px-6 pb-7 pt-24">
                  <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#e8ccff]">
                    Terapeuta AuraMeets
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-white">
                    {offer.therapist_name}
                  </h2>

                  <p className="mt-2 font-semibold text-white/80">
                    {offer.therapist_speciality}
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-5 -right-3 rounded-2xl border border-white/30 bg-white px-5 py-4 shadow-xl sm:right-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2e7fb] text-[#69329b]">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#7d45b5]">
                      Perfil
                    </p>
                    <p className="text-sm font-black text-[#101d3b]">
                      AuraMeets
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur">
                  <GiftIcon className="h-4 w-4" />
                  {offer.display_badge}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-[#f4d69c]/30 bg-[#f0c987]/15 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#ffe6b7]">
                  <SparklesIcon className="h-4 w-4" />
                  Vagas limitadas
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] text-white sm:text-5xl lg:text-6xl">
                {offer.title}
              </h1>

              {offer.subtitle && (
                <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-[#eadff2] sm:text-xl">
                  {offer.subtitle}
                </p>
              )}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <HeroInfo
                  icon={<ClockIcon className="h-5 w-5" />}
                  label="Duração"
                  value={offer.display_duration}
                />

                <HeroInfo
                  icon={<VideoIcon className="h-5 w-5" />}
                  label="Formato"
                  value={offer.display_service_type}
                />

                <HeroInfo
                  icon={<UsersIcon className="h-5 w-5" />}
                  label="Disponibilidade"
                  value={`${offer.remaining_slots} ${
                    offer.remaining_slots === 1 ? "vaga" : "vagas"
                  }`}
                />
              </div>

              <div className="mt-8 rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-white/70">
                      Valor desta experiência
                    </p>

                    <div className="mt-2 flex flex-wrap items-end gap-3">
                      {getOriginalPrice(offer) > 0 && (
                        <span className="pb-1 text-lg font-bold text-white/55 line-through">
                          {formatCurrency(getOriginalPrice(offer))}
                        </span>
                      )}

                      <span className="text-4xl font-black text-white">
                        Gratuito
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#e8d9f2]">
                      Nenhuma cobrança para solicitar esta experiência.
                    </p>
                  </div>

                  <Link
                    href={bookingHref}
                    className="inline-flex min-h-[58px] shrink-0 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#f0c987] to-[#dcae5a] px-7 text-base font-black text-[#2d173f] shadow-[0_14px_35px_rgba(240,201,135,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(240,201,135,0.35)]"
                  >
                    Quero esta experiência
                    <ArrowRightIcon className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-sm font-semibold text-white/75">
                <ShieldCheckIcon className="h-5 w-5 text-[#e4c1ff]" />
                Solicitação segura e acompanhada pela AuraMeets.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
          <div>
            <SectionEyebrow>Conheça a experiência</SectionEyebrow>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Um primeiro passo simples para cuidar de você
            </h2>

            <div className="mt-7 whitespace-pre-line text-base font-medium leading-8 text-[#566177]">
              {offer.description?.trim() ||
                offer.subtitle?.trim() ||
                "Esta experiência foi criada para proporcionar um primeiro contato com o trabalho do terapeuta, permitindo que você conheça sua abordagem antes de avançar para um acompanhamento completo."}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <BenefitCard
                icon={<HeartIcon className="h-6 w-6" />}
                title="Acolhimento inicial"
                description="Um contato respeitoso para compreender seu momento e sua necessidade."
              />

              <BenefitCard
                icon={<CompassIcon className="h-6 w-6" />}
                title="Orientação"
                description="Clareza sobre possibilidades, próximos passos e caminhos de cuidado."
              />

              <BenefitCard
                icon={<ClockIcon className="h-6 w-6" />}
                title={offer.display_duration}
                description="Uma experiência objetiva, com duração e formato apresentados com transparência."
              />

              <BenefitCard
                icon={<ShieldCheckIcon className="h-6 w-6" />}
                title="Ambiente seguro"
                description="A solicitação é realizada pela plataforma AuraMeets."
              />
            </div>

            {offer.terms && (
              <div className="mt-10 rounded-[26px] border border-[#e8dcef] bg-[#faf6fc] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eadcf3] text-[#713ca4]">
                    <InfoIcon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black">
                      Condições da experiência
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-sm font-medium leading-7 text-[#5e687a]">
                      {offer.terms}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-16">
              <SectionEyebrow>Profissional responsável</SectionEyebrow>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Sobre {offer.therapist_name}
              </h2>

              <div className="mt-7 rounded-[30px] border border-[#e8dcef] bg-white p-6 shadow-[0_18px_50px_rgba(66,42,92,0.08)] sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#8b57ba] to-[#4c246f]">
                    {offer.therapist_photo_url ? (
                      <img
                        src={offer.therapist_photo_url}
                        alt={offer.therapist_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-black text-white">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-black">
                      {offer.therapist_name}
                    </h3>

                    <p className="mt-1 font-bold text-[#7541ad]">
                      {offer.therapist_speciality}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-[#616b7c]">
                      {offer.city && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f2fa] px-4 py-2">
                          <MapPinIcon className="h-4 w-4 text-[#7541ad]" />
                          {offer.city}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f2fa] px-4 py-2">
                        <VideoIcon className="h-4 w-4 text-[#7541ad]" />
                        {offer.display_service_type}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={therapistHref}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[#d9c4e7] px-5 text-sm font-extrabold text-[#633395] transition hover:border-[#7541ad] hover:bg-[#faf6fc]"
                  >
                    Ver perfil
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <SectionEyebrow>Etapas simples</SectionEyebrow>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Como funciona
              </h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <StepCard
                  number="01"
                  title="Solicite a experiência"
                  description="Clique no botão e informe os dados necessários para o atendimento."
                />

                <StepCard
                  number="02"
                  title="Escolha ou sugira um horário"
                  description="Indique o melhor momento para realizar a experiência."
                />

                <StepCard
                  number="03"
                  title="Aguarde a confirmação"
                  description="O terapeuta receberá sua solicitação e poderá confirmar ou propor outro horário."
                />

                <StepCard
                  number="04"
                  title="Realize sua experiência"
                  description="Após a confirmação, você receberá as orientações para o atendimento."
                />
              </div>
            </div>

            <div className="mt-16">
              <SectionEyebrow>Dúvidas frequentes</SectionEyebrow>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Antes de solicitar
              </h2>

              <div className="mt-8 space-y-4">
                <FaqItem
                  question="Esta experiência é realmente gratuita?"
                  answer="Sim. Não existe cobrança para solicitar esta experiência. Caso o terapeuta apresente outros serviços, qualquer contratação futura será uma decisão exclusivamente sua."
                />

                <FaqItem
                  question="A solicitação garante o atendimento?"
                  answer="A solicitação depende da disponibilidade informada pelo terapeuta. Você receberá uma confirmação ou uma proposta de novo horário."
                />

                <FaqItem
                  question="Como receberei a confirmação?"
                  answer="As informações de confirmação serão apresentadas pelos canais cadastrados na plataforma."
                />

                <FaqItem
                  question="Posso contratar um atendimento completo depois?"
                  answer="Sim. Após conhecer o profissional, você poderá avaliar se deseja continuar o acompanhamento com ele."
                />
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-7 lg:self-start">
            <div className="rounded-[30px] border border-[#e4d5ec] bg-white p-6 shadow-[0_20px_55px_rgba(60,36,84,0.11)]">
              <span className="inline-flex rounded-full bg-[#f1e5f8] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.13em] text-[#7040a1]">
                {offer.display_badge}
              </span>

              <h2 className="mt-5 text-2xl font-black leading-tight">
                Reserve sua oportunidade
              </h2>

              <p className="mt-3 text-sm font-medium leading-7 text-[#626c7e]">
                Preencha sua solicitação e aguarde a confirmação do terapeuta.
              </p>

              <div className="mt-6 space-y-4">
                <SidebarInfo
                  icon={<ClockIcon className="h-5 w-5" />}
                  label="Duração"
                  value={offer.display_duration}
                />

                <SidebarInfo
                  icon={<VideoIcon className="h-5 w-5" />}
                  label="Formato"
                  value={offer.display_service_type}
                />

                <SidebarInfo
                  icon={<UsersIcon className="h-5 w-5" />}
                  label="Vagas restantes"
                  value={String(offer.remaining_slots)}
                />

                {offer.valid_until && (
                  <SidebarInfo
                    icon={<CalendarIcon className="h-5 w-5" />}
                    label="Disponível até"
                    value={formatDate(offer.valid_until)}
                  />
                )}
              </div>

              <div className="my-6 h-px bg-[#eee6f2]" />

              <div>
                <p className="text-sm font-bold text-[#727b8c]">
                  Valor da experiência
                </p>

                <div className="mt-1 flex items-center gap-3">
                  {getOriginalPrice(offer) > 0 && (
                    <span className="font-bold text-[#8b92a0] line-through">
                      {formatCurrency(getOriginalPrice(offer))}
                    </span>
                  )}

                  <span className="text-3xl font-black text-[#5d2e8b]">
                    Gratuito
                  </span>
                </div>
              </div>

              <Link
                href={bookingHref}
                className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7d45b5] to-[#57298f] px-6 text-sm font-black uppercase tracking-[0.05em] text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Quero participar
                <ArrowRightIcon className="h-5 w-5" />
              </Link>

              <p className="mt-4 text-center text-xs font-semibold leading-5 text-[#7a8290]">
                Ao continuar, você poderá informar seus dados e sua preferência
                de horário.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-[#1e1030]">
        <div className="mx-auto max-w-7xl px-5 py-16 text-center sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[#e7c9ff]">
            <HeartIcon className="h-7 w-7" />
          </div>

          <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.16em] text-[#d5b3ec]">
            Seu cuidado pode começar agora
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Conheça o trabalho de {offer.therapist_name} por meio desta
            experiência.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-white/70">
            Uma oportunidade para criar conexão, receber orientação e entender
            qual pode ser o próximo passo da sua jornada.
          </p>

          <Link
            href={bookingHref}
            className="mt-8 inline-flex min-h-[56px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#f0c987] to-[#dcae5a] px-8 text-base font-black text-[#2d173f] shadow-xl transition hover:-translate-y-0.5"
          >
            Solicitar experiência gratuita
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function OfferHeader() {
  return (
    <header className="border-b border-[#eee7f2] bg-white">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b55bb] to-[#512674] text-white shadow-md">
            <SparklesIcon className="h-5 w-5" />
          </div>

          <div>
            <span className="block text-xl font-black tracking-tight text-[#17213c]">
              AuraMeets
            </span>
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7541ad]">
              Conexões que transformam
            </span>
          </div>
        </Link>

        <Link
          href="/terapeutas"
          className="hidden min-h-[44px] items-center justify-center rounded-xl border border-[#dfd0e8] px-5 text-sm font-extrabold text-[#653697] transition hover:bg-[#faf6fc] sm:inline-flex"
        >
          Conhecer terapeutas
        </Link>
      </div>
    </header>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[#7541ad]">
      {children}
    </p>
  );
}

function HeroInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#f1d8ff]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-white/55">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#eadff0] bg-white p-6 shadow-[0_12px_35px_rgba(65,40,88,0.06)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e6f8] text-[#7040a1]">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-black">{title}</h3>

      <p className="mt-2 text-sm font-medium leading-7 text-[#667083]">
        {description}
      </p>
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
    <div className="rounded-[26px] border border-[#e8dcef] bg-white p-6">
      <span className="text-3xl font-black text-[#d8c2e5]">{number}</span>

      <h3 className="mt-5 text-xl font-black">{title}</h3>

      <p className="mt-3 text-sm font-medium leading-7 text-[#657083]">
        {description}
      </p>
    </div>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group rounded-[22px] border border-[#e7dcec] bg-white p-5 open:shadow-[0_12px_35px_rgba(65,40,88,0.06)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-black">
        <span>{question}</span>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2e8f8] text-[#7040a1] transition group-open:rotate-45">
          +
        </span>
      </summary>

      <p className="mt-4 pr-8 text-sm font-medium leading-7 text-[#657083]">
        {answer}
      </p>
    </details>
  );
}

function SidebarInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f2e8f8] text-[#7040a1]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#8a91a0]">
          {label}
        </p>

        <p className="mt-1 text-sm font-black text-[#17213c]">{value}</p>
      </div>
    </div>
  );
}

function getOriginalPrice(offer: FeaturedOffer): number {
  return Number(offer.original_price ?? offer.regular_price ?? 0);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    new Date(year, month - 1, day),
  );
}

type IconProps = {
  className?: string;
};

function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function GiftIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13M3 12h18M7.5 8C5.6 8 5 7 5 5.8 5 4.8 5.8 4 6.8 4 9 4 12 8 12 8M16.5 8C18.4 8 19 7 19 5.8 19 4.8 18.2 4 17.2 4 15 4 12 8 12 8" />
    </svg>
  );
}

function SparklesIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2L12 3Z" />
      <path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14Z" />
      <path d="m19 13-.8 2.2L16 16l2.2.8L19 19l.8-2.2L22 16l-2.2-.8L19 13Z" />
    </svg>
  );
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function VideoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="m16 10 5-3v10l-5-3" />
    </svg>
  );
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HeartIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function CompassIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" />
    </svg>
  );
}

function InfoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function MapPinIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}