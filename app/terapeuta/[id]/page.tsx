import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getTherapistBySlug } from "@/lib/therapists";
type PageProps = {
  params: Promise<{ id: string }>;
};
type Testimonial = {
  id: string;
  client_name: string;
  testimonial: string;
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
  if (service.promotional_price === null || service.promotional_price === "") {
    return null;
  }
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
  if (formatos.has("relatorio_pdf")) {
    labels.push("Relatório em PDF");
  }
  if (formatos.has("relatorio_audio")) {
    labels.push("Relatório + Áudio");
  }
  if (formatos.has("relatorio_consulta")) {
    labels.push("Relatório + Consulta");
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
  const isLong = text.length > 210 || text.split("\n").length > 4;
  if (!isLong) {
    return <p className={`whitespace-pre-wrap break-words ${className}`}>{text}</p>;
  }

  return (
    <details className="group">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="block group-open:hidden">
          <span
            className={`block overflow-hidden whitespace-pre-wrap break-words ${className}`}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 4,
            }}
          >
            {text}
          </span>
          <span className="mt-2 inline-block text-sm font-bold uppercase tracking-wide text-[#7232a6]">
            Leia mais
          </span>
        </span>
        <span className="hidden text-sm font-bold uppercase tracking-wide text-[#7232a6] group-open:inline-block">
          Leia menos
        </span>
      </summary>
      <p className={`mt-3 whitespace-pre-wrap break-words ${className}`}>{text}</p>
    </details>
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
  // Depoimentos públicos vinculados ao UUID de autenticação do terapeuta.
  let testimonials: Testimonial[] = [];
  if (therapist.profile_id) {
    const { data, error } = await supabase
      .from("therapist_testimonials")
      .select("id,client_name,testimonial")
      .eq("therapist_id", therapist.profile_id)
      .eq("status", "approved")
      .eq("publication_authorized", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erro ao carregar depoimentos públicos:", error);
    } else {
      testimonials = (data ?? []) as Testimonial[];
    }
  }

  // experiences.therapist_id é bigint (therapists.id), nunca o UUID profile_id.
  let hasPresent = false;
  let presentDetails: { title: string; description: string | null } | null = null;
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
      .select("offer_type,quantity_available,title,description")
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
      const presentOffer = availableOffers.find((offer) => offer.offer_type === "presente");
      hasPresent = Boolean(presentOffer);
      if (presentOffer) {
        presentDetails = { title: presentOffer.title, description: presentOffer.description };
      }
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
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Olá! Conheci seu perfil no AuraMeets e gostaria de conversar sobre seus atendimentos.`)}`
    : "";
  const purpose = therapist.bio || "Conheça este profissional e encontre a experiência ideal para o seu momento.";
  const presentAvailable = hasPresent && presentDetails !== null;

  return (
    <main className="min-h-screen bg-[#fffdfa] text-[#241b39]">
      <div className="w-full pb-16">
        <div className="relative w-full overflow-hidden">
          <img src="/aurameets-minisite.png" alt="AuraMeets: mãos se aproximando ao pôr do sol" className="block h-auto w-full" />
          <div className="absolute left-0 right-0 top-[34%] flex justify-center px-3 sm:top-[36%]">
            <h1 className="max-w-[90%] rounded-xl bg-white/70 px-4 py-1 text-center text-[clamp(1.05rem,4.8vw,3.5rem)] font-extrabold uppercase tracking-[0.04em] text-[#421080] shadow-sm backdrop-blur-[3px]">
              {headline}
            </h1>
          </div>
        </div>

        <section className="mx-auto w-full pt-12 text-center sm:max-w-4xl sm:px-8 sm:pt-16" aria-labelledby="terapeuta-titulo">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#966c28]">Conheça seu terapeuta</p>
          <h2 id="terapeuta-titulo" className="mt-3 font-serif text-4xl text-[#3b176b] sm:text-5xl">{name}</h2>
          <p className="mt-3 px-4 text-base text-[#5b5268]">{headline}{location ? ` · ${location}` : ""}</p>
          <div className="mx-auto mt-7 flex aspect-square w-full items-center justify-center overflow-hidden border-y-4 border-[#e9d5f4] bg-[#f5edf9] text-center text-base font-medium text-[#79559a] sm:w-[400px] sm:border-4">
            {photo ? (
              <img src={photo} alt={`Foto profissional de ${name}`} className="h-full w-full object-contain" />
            ) : (
              <span className="font-serif text-6xl text-[#7935C5]">{getInitials(name)}</span>
            )}
          </div>
        </section>

        {presentAvailable && presentDetails && (
          <section className="mt-12 w-full border-y border-[#e8d9ec] px-4 py-12 text-center sm:py-16" aria-labelledby="experiencia-presente-titulo">
            <div className="mx-auto max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#966c28]">Experiência Presente</p>
              <h2 id="experiencia-presente-titulo" className="mt-3 font-serif text-3xl text-[#3b176b] sm:text-4xl">{presentDetails.title}</h2>
              {presentDetails.description && <div className="mx-auto mt-4 max-w-2xl"><ExpandableText text={presentDetails.description} className="leading-7 text-[#5b5268]" /></div>}
              {whatsappNumber && <a href={presentHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#7232a6] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white sm:w-auto">Quero receber</a>}
            </div>
          </section>
        )}

        <section className="mx-auto mt-16 w-full border-y border-[#e8d9ec] px-4 py-12 text-center sm:max-w-4xl sm:px-8 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#966c28]">O que me inspira</p>
          <h2 className="mt-3 font-serif text-3xl text-[#3b176b] sm:text-4xl">Meu propósito</h2>
          <div className="mx-auto mt-6 max-w-3xl"><ExpandableText text={purpose} className="text-lg leading-9 text-[#51465f]" /></div>
        </section>

        <section id="servicos" className="mx-auto w-full scroll-mt-24 px-4 py-14 sm:max-w-5xl sm:px-8 sm:py-20" aria-labelledby="servicos-titulo">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#966c28]">Escolha seu atendimento</p>
            <h2 id="servicos-titulo" className="mt-3 font-serif text-3xl text-[#3b176b] sm:text-4xl">Meus serviços</h2>
          </div>
          {services.length > 0 ? (
            <div className="mt-9 divide-y divide-[#e8d9ec] border-y border-[#e8d9ec]">
              {services.map((service) => {
                const discount = getDiscountPercentage(service);
                return (
                  <article key={service.id} className="grid gap-7 py-9 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center md:gap-12">
                    {service.cover_photo_url && (
                      <div className="aspect-[16/10] overflow-hidden rounded-[22px] bg-[#f5edf9]">
                        <img src={service.cover_photo_url} alt={`Fotografia de ${service.name}`} className="h-full w-full object-contain" loading="lazy" />
                      </div>
                    )}
                    <div>
                      {service.category && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#966c28]">{service.category}</p>}
                      <h3 className="font-serif text-2xl text-[#3b176b] sm:text-3xl">{service.name}</h3>
                      {service.description && <div className="mt-3"><ExpandableText text={service.description} className="leading-7 text-[#5b5268]" /></div>}
                      <p className="mt-4 text-sm font-medium text-[#675c73]">{service.duration_minutes ? `${service.duration_minutes} minutos · ` : ""}{getDeliveryLabel(service)}</p>
                      {discount !== null ? (
                        <div className="mt-4">
                          <p className="text-base text-[#847b8b] line-through">{formatCurrency(service.price, service.currency || "BRL")}</p>
                          <p className="mt-1 text-2xl font-extrabold text-[#6d28a7]">{formatCurrency(getFinalPrice(service), service.currency || "BRL")}</p>
                          <p className="mt-1 text-sm font-semibold text-[#966c28]">Desconto especial · {discount}% OFF</p>
                        </div>
                      ) : (
                        <p className="mt-4 text-2xl font-extrabold text-[#6d28a7]">{formatCurrency(service.price, service.currency || "BRL")}</p>
                      )}
                      <Link href={`/comprar?servico=${encodeURIComponent(service.id)}`} className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#7232a6] px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white sm:w-auto">Quero agendar</Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <p className="mt-9 text-center text-[#5b5268]">Este profissional ainda não publicou serviços.</p>}
        </section>

        {testimonials.length > 0 && (
          <section id="depoimentos" className="mx-auto w-full border-t border-[#e8d9ec] px-4 py-12 text-center sm:max-w-4xl sm:px-8" aria-labelledby="depoimentos-titulo">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#966c28]">Experiências compartilhadas</p>
            <h2 id="depoimentos-titulo" className="mt-3 font-serif text-3xl text-[#3b176b] sm:text-4xl">Depoimentos</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#5b5268]">Depoimentos informados pelo terapeuta e autorizados para publicação. Não são avaliações verificadas pelo AuraMeets.</p>
            <div className="mt-9 grid gap-8 text-left sm:grid-cols-2 sm:gap-12">
              {testimonials.map((item) => (
                <blockquote key={item.id} className="border-t border-[#e8d9ec] pt-5">
                  <ExpandableText text={`“${item.testimonial}”`} className="italic leading-8 text-[#51465f]" />
                  <footer className="mt-3 text-sm font-semibold text-[#6d28a7]">{item.client_name}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {whatsappNumber && (
          <section className="mx-auto w-full border-t border-[#e8d9ec] px-4 py-12 text-center sm:max-w-4xl sm:px-8">
            <h2 className="font-serif text-3xl text-[#3b176b]">Vamos conversar?</h2>
            <p className="mt-4 text-[#5b5268]">Entre em contato para saber mais sobre os atendimentos.</p>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#1b9e66] px-7 py-3.5 font-bold text-white">WhatsApp</a>
          </section>
        )}
        <footer className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-[#e8d9ec] px-4 pt-7 text-center text-xs text-[#71677d]">
          <span>AuraMeets · Conecta · Transforma · Realiza</span>
          <Link href="/home3" className="underline underline-offset-4">Voltar à Home</Link>
        </footer>
      </div>
    </main>
  );
}
