import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTherapistBySlug } from "@/lib/therapists";
type IconName =
  | "calendar"
  | "bag"
  | "cart"
  | "gift"
  | "ticket"
  | "share"
  | "whatsapp"
  | "check";
type PageProps = {
  params: Promise<{ id: string }>;
};
type Service = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  cover_photo_url: string | null;
  online: boolean | null;
  in_person: boolean | null;
  delivery_formats: string[] | null;
  duration_minutes: number | null;
  price: number | string | null;
  promotional_price: number | string | null;
  currency: string | null;
  display_order: number | null;
};
function formatCurrency(
  value: number | string | null,
  currency = "BRL",
) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "Consultar";
  return amount.toLocaleString("pt-BR", {
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
function getFinalPrice(service: Service) {
  const promotional = Number(service.promotional_price);
  return service.promotional_price !== null &&
    Number.isFinite(promotional)
    ? promotional
    : service.price;
}
function getDiscountPercentage(service: Service) {
  const originalPrice = Number(service.price);
  const promotionalPrice = Number(service.promotional_price);
  if (
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(promotionalPrice) ||
    originalPrice <= 0 ||
    promotionalPrice < 0 ||
    promotionalPrice >= originalPrice
  ) {
    return null;
  }
  return Math.round(
    ((originalPrice - promotionalPrice) / originalPrice) * 100,
  );
}
function getDeliveryLabel(service: Service) {
  const formatos = new Set(service.delivery_formats ?? []);
  if (service.online) {
    formatos.add("online");
  }
  if (service.in_person) {
    formatos.add("presencial");
  }
  const labels: string[] = [];
  if (formatos.has("online")) {
    labels.push("Online");
  }
  if (formatos.has("presencial")) {
    labels.push("Presencial");
  }
  if (formatos.has("pdf_documento")) {
    labels.push("PDF / Documento");
  }
  if (formatos.has("video")) {
    labels.push("Vídeo");
  }
  if (formatos.has("audio")) {
    labels.push("Áudio");
  }
  if (labels.length === 0) {
    return "Consulte a forma de entrega";
  }
  return labels.join(" · ");
}
function ExpandableText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <details className="group">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="block group-open:hidden">
          <span
            className={`overflow-hidden whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${className}`}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 4,
            }}
          >
            {text}
          </span>
          <span className="mt-3 inline-flex text-xs font-extrabold uppercase tracking-[0.12em] text-[#d9bd66] transition hover:text-[#f1dc92]">
            Leia mais
          </span>
        </span>
        <span className="mt-3 hidden text-xs font-extrabold uppercase tracking-[0.12em] text-[#d9bd66] transition hover:text-[#f1dc92] group-open:inline-flex">
          Leia menos
        </span>
      </summary>
      <p className={`mt-2 whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${className}`}>
        {text}
      </p>
    </details>
  );
}
function Icon({
  name,
  className = "h-6 w-6",
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    cart: (
      <>
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M2 3h2l2.5 12h13l2-9H5" />
      </>
    ),
    bag: (
      <>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13M3 12h18M12 8H8.5a2.5 2.5 0 1 1 2.2-3.7L12 8Zm0 0h3.5a2.5 2.5 0 1 0-2.2-3.7L12 8Z" />
      </>
    ),
    ticket: (
      <>
        <path d="M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V7Z" />
        <path d="M13 5v2M13 10v2M13 15v4" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.4-4.4A8.4 8.4 0 1 1 20.5 11.7Z" />
        <path d="M8.2 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4-.1.6.5 1 1.3 1.8 2.2 2.4.8.5 1.4.7 1.7.8.3.1.5 0 .7-.2l.9-1.1c.2-.3.5-.3.8-.2l1.8.9c.3.1.5.3.5.5 0 .3-.1 1.4-.8 2-.6.6-1.5.9-2.4.8-1.2-.1-2.7-.6-4.5-1.8-2.6-1.7-4.3-4.4-4.4-4.6-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2.1.9-2.5Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export default async function TherapistPage({
  params,
}: PageProps) {
  const { id } = await params;
  const therapist = await getTherapistBySlug(id);
  if (!therapist) notFound();
  let services: Service[] = [];
  if (therapist.profile_id) {
    const { data, error } = await supabase
      .from("services")
      .select(
        "id,name,category,description,cover_photo_url,online,in_person,delivery_formats,duration_minutes,price,promotional_price,currency,display_order",
      )
      .eq("therapist_id", therapist.profile_id)
      .eq("status", "active")
      .order("display_order", {
        ascending: true,
        nullsFirst: false,
      })
      .order("created_at", { ascending: true });
    if (error) {
      console.error(
        "Erro ao carregar serviços públicos:",
        error,
      );
    } else {
      services = (data ?? []) as Service[];
    }
  }
  // experiences.therapist_id é bigint (therapists.id), nunca o UUID profile_id.
  let hasPresent = false;
  const therapistEmail =
    "email" in therapist && typeof therapist.email === "string"
      ? therapist.email.trim().toLowerCase()
      : "";
  // Busca o ID numérico do terapeuta. Caso o e-mail não esteja disponível
  // no perfil público, usa o nome exato como alternativa.
  const { data: therapistRecord, error: therapistLookupError } =
    await supabase
      .from("therapists")
      .select("id")
      .eq(therapistEmail ? "email" : "name", therapistEmail || therapist.name)
      .maybeSingle();
  if (therapistLookupError) {
    console.error("Erro ao identificar terapeuta para ofertas:", therapistLookupError);
  } else if (therapistRecord && /^\d+$/.test(String(therapistRecord.id))) {
    const { data: offers, error: offersError } = await supabase
      .from("experiences")
      .select("offer_type,quantity_available")
      .eq("therapist_id", therapistRecord.id)
      .eq("approval_status", "approved")
      .eq("active", true)
      .in("offer_type", ["presente", "desconto"]);
    if (offersError) {
      console.error("Erro ao carregar ofertas do terapeuta:", offersError);
    } else {
      const availableOffers = (offers ?? []).filter(
        (offer) => offer.quantity_available === null || offer.quantity_available > 0,
      );
      hasPresent = availableOffers.some((offer) => offer.offer_type === "presente");
    }
  } else {
    console.error("Não foi encontrado um ID numérico para as ofertas do terapeuta.");
  }
  const name =
    therapist.name || "Profissional AuraMeets";
  const headline =
    therapist.speciality || "Terapeuta AuraMeets";
  const location = [
    therapist.city,
    therapist.state,
  ]
    .filter(Boolean)
    .join(", ");
  const photo =
    therapist.profile_photo_url ||
    therapist.photo_url;
  const rawWhatsapp = (therapist.phone ?? "").trim();
  const whatsapp = rawWhatsapp.replace(/\D/g, "");
  let whatsappNumber = "";
  if (rawWhatsapp.startsWith("+")) {
    // Número já cadastrado em formato internacional.
    // Preserva qualquer DDI: +81 Japão, +55 Brasil, +1 EUA etc.
    whatsappNumber = whatsapp;
  } else if (/^81(?:70|80|90)\d{8}$/.test(whatsapp)) {
    // Japão já cadastrado com DDI, mas sem o sinal +
    whatsappNumber = whatsapp;
  } else if (/^0(?:70|80|90)\d{8}$/.test(whatsapp)) {
    // Celular japonês cadastrado no formato local:
    // 09012345678 -> 819012345678
    whatsappNumber = `81${whatsapp.slice(1)}`;
  } else if (/^55\d{10,11}$/.test(whatsapp)) {
    // Brasil já cadastrado com DDI
    whatsappNumber = whatsapp;
  } else if (/^\d{10,11}$/.test(whatsapp)) {
    // Compatibilidade com cadastros brasileiros antigos sem +55
    whatsappNumber = `55${whatsapp}`;
  } else {
    // Outros países: não força o DDI brasileiro
    whatsappNumber = whatsapp;
  }
  const presentHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá, sou visitante do AuraMeets e quero meu presente")}`
    : "#servicos";
  // A única ação no topo é a experiência presente, quando disponível.
  return (
    <main className="min-h-screen bg-[#F7F8FC] text-[#17213B] selection:bg-[#EAD5FF] selection:text-[#351454]">
      <header className="w-full bg-[#0A1034]">
        <img
          src="/cabecalho-perfil-terapeuta-aurameets.png"
          alt="AuraMeets — Terapeuta qualificado com segurança"
          className="block h-auto w-full"
        />
      </header>
      <section className="mx-auto max-w-6xl px-5 pb-7 pt-8 sm:px-8 sm:pt-12">
        <div className="rounded-[1.7rem] border border-[#E7E0F0] bg-white p-5 shadow-sm sm:p-9">
          <div className="grid items-center gap-8 md:grid-cols-[240px_1fr] lg:gap-12">
            <div className="mx-auto md:mx-0">
              <div className="relative h-52 w-52 sm:h-60 sm:w-60">
                <div className="h-full w-full rounded-[2.4rem] bg-gradient-to-br from-[#E2C66E] via-[#8A35D1] to-[#3B1A6B] p-[2px]">
                  <div className="grid h-full w-full place-items-center overflow-hidden rounded-[2.3rem] bg-[#F3EAF9]">
                    {photo ? (
                      <img src={photo} alt={`Foto profissional de ${name}`} className="h-full w-full object-cover object-top" />
                    ) : (
                      <span className="font-serif text-6xl text-[#7436A6]">{getInitials(name)}</span>
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#E1D3EF] bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B299D] shadow-sm">
                  <Icon name="check" className="h-3.5 w-3.5" />
                  Profissional verificada
                </span>
              </div>
            </div>
            <div className="min-w-0 text-center md:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#7D36B5]">Perfil profissional AuraMeets</p>
              <h1 className="font-serif text-4xl font-medium leading-tight text-[#1D1538] sm:text-5xl">{name}</h1>
              <p className="mt-3 text-base font-semibold text-[#8241B2] sm:text-lg">{headline}</p>
              <div className="mx-auto mt-4 max-w-2xl md:mx-0">
                <ExpandableText
                  text={therapist.bio || "Conheça este profissional e encontre a experiência ideal para o seu momento."}
                  className="text-sm leading-7 text-[#47516A] sm:text-base"
                />
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                {[therapist.service_type, location].filter(Boolean).map((item) => (
                  <span key={String(item)} className="rounded-full border border-[#E5DCF0] bg-[#F9F5FD] px-3 py-1.5 text-xs text-[#694D80]">{item}</span>
                ))}
              </div>
            </div>
          </div>
          {hasPresent && whatsappNumber && (
            <div className="mt-10 flex justify-center border-t border-[#ECE6F2] pt-6">
              <Link
                href={presentHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#16A34A] px-7 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#12813C]"
              >
                <Icon name="gift" className="h-6 w-6" />
                Experiência Presente
              </Link>
            </div>
          )}
        </div>
      </section>
      <section
        id="servicos"
        className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-8 sm:pb-20"
      >
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7D36B5]">
              Atendimentos e experiências
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Serviços oferecidos
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#59647B]">
            Escolha a experiência ideal para o seu momento e
            contrate o serviço desejado.
          </p>
        </div>
        {services.length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {services.map((service, index) => (
              <article
                key={service.id}
                className="group overflow-hidden rounded-[1.35rem] border border-[#E6E1EF] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#B68ED7] sm:rounded-[1.7rem] lg:grid lg:grid-cols-5 lg:items-stretch"
              >
                <div
                  className={`relative aspect-[16/9] w-full self-start overflow-hidden bg-gradient-to-br sm:aspect-video lg:aspect-auto lg:self-stretch lg:col-span-2 ${
                    index % 3 === 0
                      ? "from-[#8d6a24] via-[#d8b95d] to-[#75500e]"
                      : index % 3 === 1
                        ? "from-[#5d2469] via-[#a95bb2] to-[#33113c]"
                        : "from-[#19394d] via-[#3f8191] to-[#10232d]"
                  }`}
                >
                  {service.cover_photo_url && (
                    <img
                      src={service.cover_photo_url}
                      alt={`Imagem de ${service.name}`}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(255,255,255,0.26),transparent_26%),linear-gradient(0deg,rgba(5,5,7,0.45),transparent)]" />
                  <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur sm:bottom-4 sm:left-5 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.18em]">
                    {service.category ||
                      "Serviço AuraMeets"}
                  </div>
                </div>
                <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-3 lg:p-8">
                  <h3 className="font-serif text-[1.55rem] leading-tight text-[#1D1538] sm:text-2xl">
                    {service.name}
                  </h3>
                  <div className="mt-2 sm:mt-3 sm:min-h-[96px]">
                    <ExpandableText
                      text={
                        service.description ||
                        "Conheça esta experiência oferecida pelo profissional."
                      }
                      className="text-[13px] leading-5 text-[#59647B] sm:text-sm sm:leading-6"
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#59647B] sm:mt-5">
                    {service.duration_minutes && (
                      <span className="rounded-full border border-[#E6E1EF] bg-[#F6F3FA] px-3 py-2">
                        {service.duration_minutes} minutos
                      </span>
                    )}
                    <div className="w-full rounded-xl border border-[#C4A0EA] bg-[#F3E8FF] px-4 py-3 text-[#35165A]">
                      <p className="text-base font-extrabold uppercase leading-6 tracking-wide text-[#581C87]">
                        FORMA DE ENTREGA
                      </p>
                      <p className="mt-1 break-words text-base font-semibold leading-6 sm:text-lg">
                        {getDeliveryLabel(service)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[#E8E2F0] pt-4 sm:mt-6 sm:pt-5">
                    <span className="block text-[9px] uppercase tracking-widest text-[#667086] sm:text-[10px]">
                      Investimento
                    </span>
                    {getDiscountPercentage(service) !== null && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <strong className="text-lg font-black text-[#8B7498] line-through decoration-2 sm:text-xl">
                          {formatCurrency(service.price, service.currency || "BRL")}
                        </strong>
                        <span className="inline-flex items-center rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-emerald-700 sm:text-[11px]">
                          {getDiscountPercentage(service)}% OFF
                        </span>
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-2 items-stretch gap-2 sm:gap-4">
                      <strong className="flex min-h-14 min-w-0 items-center justify-center rounded-xl border border-emerald-200 bg-[#E3F5E7] px-1 py-2 text-center text-[clamp(0.9rem,3.5vw,1.5rem)] font-black leading-tight text-[#176534] sm:px-2 sm:text-2xl">
                        {formatCurrency(getFinalPrice(service), service.currency || "BRL")}
                      </strong>
                      <Link
                        href={`/comprar?servico=${encodeURIComponent(service.id)}`}
                        className="inline-flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-xl bg-[#FFD32A] px-2 py-2 text-center text-[10px] font-extrabold uppercase leading-tight tracking-wide text-black transition hover:bg-[#F2C400] sm:px-4 sm:text-sm"
                      >
                        <Icon name="cart" className="h-5 w-5 shrink-0 text-black" />
                        Quero contratar
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.7rem] border border-dashed border-[#D9C5EE] bg-white p-8 text-center text-[#59647B]">
            Este profissional ainda não publicou serviços.
          </div>
        )}
      </section>
      <footer className="border-t border-[#E8E2F0] bg-white px-5 py-8 text-center text-xs text-[#667086]">
        AuraMeets · Conecta · Transforma · Realiza
      </footer>
    </main>
  );
}
