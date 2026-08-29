type Therapist = {
  id: number;
  profile_id: string | null;
  slug: string;
  name: string;
  speciality: string | null;
  city: string | null;
  state: string | null;
  profile_photo_url: string | null;
  photo_url: string | null;
  phone: string | null;
  verified: boolean | null;
  active: boolean | null;
};

type Service = {
  id: string;
  therapist_id: string;
  name: string;
  category: string;
  description: string;
  online: boolean;
  in_person: boolean;
  price: number | string;
  promotional_price: number | string | null;
  currency: string;
  status: "active" | "inactive" | "under_review";
};

type GiftCategory = {
  key: "reiki" | "astrologico" | "numerologico" | "terapeutico";
  title: string;
  subtitle: string;
  keywords: string[];
};

const giftCategories: GiftCategory[] = [
  {
    key: "reiki",
    title: "PRESENTE SESSÃO DE REIKI",
    subtitle: "Encontre profissionais que oferecem Reiki.",
    keywords: ["reiki"],
  },
  {
    key: "astrologico",
    title: "PRESENTE ASTROLÓGICO",
    subtitle: "Encontre experiências ligadas à Astrologia.",
    keywords: [
      "astrologia",
      "astrologico",
      "astrológico",
      "mapa astral",
      "revolucao solar",
      "revolução solar",
    ],
  },
  {
    key: "numerologico",
    title: "PRESENTE NUMEROLÓGICO",
    subtitle: "Encontre experiências ligadas à Numerologia.",
    keywords: [
      "numerologia",
      "numerologico",
      "numerológico",
      "mapa numerologico",
      "mapa numerológico",
    ],
  },
  {
    key: "terapeutico",
    title: "PRESENTE TERAPÊUTICO",
    subtitle: "Encontre serviços terapêuticos disponíveis para presentear.",
    keywords: ["terapia", "terapeutico", "terapêutico", "terapeutica", "terapêutica"],
  },
];

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

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function cleanPhone(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function formatPhone(value: string | null | undefined) {
  const digits = cleanPhone(value);

  if (!digits) {
    return "";
  }

  if (digits.startsWith("55") && digits.length >= 12) {
    const local = digits.slice(2);
    const ddd = local.slice(0, 2);
    const number = local.slice(2);

    if (number.length === 9) {
      return `+55 (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`;
    }

    return `+55 (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }

  return value ?? "";
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

async function getActiveTherapists(): Promise<Therapist[]> {
  const { supabaseUrl, supabasePublicKey } = getSupabasePublicConfig();

  if (!supabaseUrl || !supabasePublicKey) {
    return [];
  }

  const query = new URLSearchParams({
    select:
      "id,profile_id,slug,name,speciality,city,state,profile_photo_url,photo_url,phone,verified,active",
    active: "eq.true",
    order: "name.asc",
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
        "Não foi possível carregar os profissionais:",
        await response.text(),
      );
      return [];
    }

    return (await response.json()) as Therapist[];
  } catch (error) {
    console.error("Erro ao carregar profissionais:", error);
    return [];
  }
}

async function getActiveServices(): Promise<Service[]> {
  const { supabaseUrl, supabasePublicKey } = getSupabasePublicConfig();

  if (!supabaseUrl || !supabasePublicKey) {
    return [];
  }

  const query = new URLSearchParams({
    select:
      "id,therapist_id,name,category,description,online,in_person,price,promotional_price,currency,status",
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
        "Não foi possível carregar os serviços:",
        await response.text(),
      );
      return [];
    }

    return (await response.json()) as Service[];
  } catch (error) {
    console.error("Erro ao carregar serviços:", error);
    return [];
  }
}

function serviceMatchesCategory(
  service: Service,
  category: GiftCategory,
) {
  const searchable = normalizeText(
    `${service.name} ${service.category}`,
  );

  return category.keywords.some((keyword) =>
    searchable.includes(normalizeText(keyword)),
  );
}

function TherapistGiftCard({
  therapist,
  service,
}: {
  therapist: Therapist;
  service: Service;
}) {
  const photo =
    therapist.profile_photo_url?.trim() ||
    therapist.photo_url?.trim() ||
    null;

  const phone = cleanPhone(therapist.phone);
  const whatsappText = `Olá, ${therapist.name}! Vi seu perfil no AuraMeets e gostaria de presentear alguém com "${service.name}".`;
  const whatsappHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`
    : null;

  const location = [therapist.city, therapist.state]
    .filter(Boolean)
    .join(" - ");

  return (
    <article className="h-full overflow-hidden rounded-[24px] border border-[#eee8f2] bg-white shadow-[0_10px_28px_rgba(76,42,87,0.07)]">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#f3eef5] shadow-md sm:h-[72px] sm:w-[72px]">
            {photo ? (
              <img
                src={photo}
                alt={`Foto de ${therapist.name}`}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-xl font-black text-[#7b2f72]">
                {therapist.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part.charAt(0))
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-[#24252a]">
                {therapist.name}
              </h3>

              {therapist.verified && (
                <span className="rounded-full bg-[#f7f1e7] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.04em] text-[#5c5246]">
                  Profissional verificado
                </span>
              )}
            </div>

            {therapist.speciality && (
              <p className="mt-1 font-bold text-[#7b2f72]">
                {therapist.speciality}
              </p>
            )}

            {location && (
              <p className="mt-1 text-sm text-[#70727a]">
                {location}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-[#f0ebf2] pt-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#9a6d92]">
            Presente disponível
          </p>

          <h4 className="mt-2 text-lg font-black text-[#2d2e33]">
            {service.name}
          </h4>

          {service.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#666871]">
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
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#f0ebf2] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
{therapist.phone && (
                <p className="mt-1 text-sm font-semibold text-[#64666d]">
                  WhatsApp: {formatPhone(therapist.phone)}
                </p>
              )}
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-[#6a2b66] px-5 py-3 text-center text-sm font-black text-white transition hover:brightness-105"
              >
                QUERO PRESENTEAR
              </a>
            ) : (
              <a
                href={`/terapeutas/${therapist.slug}`}
                className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-[#7b2f72] px-5 py-3 text-center text-sm font-black text-[#7b2f72]"
              >
                VER PERFIL
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function PresentearPage() {
  const [therapists, services] = await Promise.all([
    getActiveTherapists(),
    getActiveServices(),
  ]);

  const therapistByProfileId = new Map(
    therapists
      .filter((therapist) => therapist.profile_id)
      .map((therapist) => [therapist.profile_id as string, therapist]),
  );

  const categoriesWithItems = giftCategories
    .map((category) => {
      const items = services
        .filter((service) => serviceMatchesCategory(service, category))
        .map((service) => {
          const therapist = therapistByProfileId.get(service.therapist_id);

          if (!therapist) {
            return null;
          }

          return {
            therapist,
            service,
          };
        })
        .filter(
          (
            item,
          ): item is {
            therapist: Therapist;
            service: Service;
          } => Boolean(item),
        );

      return {
        category,
        items,
      };
    })
    .filter(({ items }) => items.length > 0);

  return (
    <main className="min-h-screen bg-white text-[#24262b]">
      <header className="border-b border-[#eee8f2] bg-[#5b1f61]">
        <div className="mx-auto flex min-h-[84px] max-w-6xl items-center justify-between gap-5 px-5 sm:px-8">
          <a href="/" className="shrink-0">
            <div className="text-[25px] font-black tracking-[0.02em] text-white sm:text-[30px]">
              AURA<span className="text-[#e0b24a]">MEETS</span>
            </div>
          </a>

          <div className="flex items-center gap-5 text-xs font-black uppercase text-white">
            <a
              href="/terapeutas"
              className="hidden transition hover:text-[#f2d48b] sm:inline"
            >
              Terapeutas
            </a>

            <a
              href="/"
              className="rounded-full border border-white/70 px-4 py-2.5 transition hover:bg-white hover:text-[#5b1f61]"
            >
              Início
            </a>
          </div>
        </div>
      </header>

      <section className="border-b border-[#f0ebf2] bg-[#fbf9fc]">
        <div className="mx-auto max-w-6xl px-5 py-9 text-center sm:px-8 sm:py-12">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#9b6a94]">
            AuraMeets Presentes
          </p>

          <h1 className="mx-auto mt-3 max-w-4xl text-3xl font-black leading-tight text-[#25252b] sm:text-5xl">
            Dê uma experiência.
            <span className="block text-[#7b2f72]">
              Presenteie com cuidado.
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#666871] sm:text-base">
            Escolha uma categoria e encontre os presentes já publicados pelos profissionais.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {categoriesWithItems.map(({ category }) => (
              <a
                key={category.key}
                href={`#${category.key}`}
                className="rounded-full border border-[#decfe0] bg-white px-4 py-2.5 text-xs font-black text-[#6a2b66] shadow-sm transition hover:border-[#7b2f72] hover:bg-[#faf5fb]"
              >
                {category.key === "reiki" && "REIKI"}
                {category.key === "astrologico" && "ASTROLÓGICO"}
                {category.key === "numerologico" && "NUMEROLÓGICO"}
                {category.key === "terapeutico" && "TERAPÊUTICO"}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {categoriesWithItems.length > 0 ? (
          <div className="space-y-12">
            {categoriesWithItems.map(({ category, items }) => (
              <section
                key={category.key}
                id={category.key}
                className="scroll-mt-6"
              >
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9b6a94]">
                      Presente AuraMeets
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-[#63265f] sm:text-3xl">
                      {category.title}
                    </h2>
                  </div>

                  <p className="text-sm text-[#777880]">
                    {items.length} {items.length === 1 ? "opção disponível" : "opções disponíveis"}
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {items.map(({ therapist, service }) => (
                    <TherapistGiftCard
                      key={`${category.key}-${therapist.id}-${service.id}`}
                      therapist={therapist}
                      service={service}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-[26px] border border-dashed border-[#d8cfdb] bg-[#fbf9fc] p-8 text-center">
            <p className="text-lg font-bold text-[#6f7077]">
              Ainda não existem presentes publicados pelos profissionais.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}