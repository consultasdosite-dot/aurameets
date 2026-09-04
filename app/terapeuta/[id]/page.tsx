import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { getTherapistBySlug } from "@/lib/therapists";

type IconName = "calendar" | "bag" | "gift" | "ticket" | "share" | "check";

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
  duration_minutes: number | null;
  price: number | string | null;
  promotional_price: number | string | null;
  currency: string | null;
};

function formatCurrency(value: number | string | null, currency = "BRL") {
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
  return service.promotional_price !== null && Number.isFinite(promotional)
    ? promotional
    : service.price;
}

function getModality(service: Service) {
  if (service.online && service.in_person) return "Online ou presencial";
  if (service.online) return "Online";
  if (service.in_person) return "Presencial";
  return "Consulte a modalidade";
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
            className={`overflow-hidden whitespace-pre-line ${className}`}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 6,
            }}
          >
            {text}
          </span>

          <span className="mt-2 inline-flex text-xs font-extrabold uppercase tracking-[0.12em] text-[#d9bd66] transition hover:text-[#f1dc92]">
            Ver mais
          </span>
        </span>

        <span className="mt-2 hidden text-xs font-extrabold uppercase tracking-[0.12em] text-[#d9bd66] transition hover:text-[#f1dc92] group-open:inline-flex">
          Ver menos
        </span>
      </summary>

      <p className={`mt-2 whitespace-pre-line ${className}`}>
        {text}
      </p>
    </details>
  );
}

function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    bag: <><path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    gift: <><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8H8.5a2.5 2.5 0 1 1 2.2-3.7L12 8Zm0 0h3.5a2.5 2.5 0 1 0-2.2-3.7L12 8Z"/></>,
    ticket: <><path d="M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4V7Z"/><path d="M13 5v2M13 10v2M13 15v4"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };

  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default async function TherapistPage({ params }: PageProps) {
  const { id } = await params;
  const therapist = await getTherapistBySlug(id);

  if (!therapist) notFound();

  let services: Service[] = [];

  if (therapist.profile_id) {
    const { data, error } = await supabase
      .from("services")
      .select(
        "id,name,category,description,cover_photo_url,online,in_person,duration_minutes,price,promotional_price,currency",
      )
      .eq("therapist_id", therapist.profile_id)
      .eq("status", "active")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar serviços públicos:", error);
    } else {
      services = (data ?? []) as Service[];
    }
  }

  const name = therapist.name || "Profissional AuraMeets";
  const headline = therapist.speciality || "Terapeuta AuraMeets";
  const location = [therapist.city, therapist.state].filter(Boolean).join(", ");
  const photo = therapist.profile_photo_url || therapist.photo_url;
  const whatsapp = (therapist.phone ?? "").replace(/\D/g, "");
  const whatsappNumber = whatsapp && !whatsapp.startsWith("55") ? `55${whatsapp}` : whatsapp;
  const scheduleMessage = encodeURIComponent(
    `Olá, ${name}! Vi seu perfil no AuraMeets e quero agendar um atendimento.`,
  );
  const scheduleHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${scheduleMessage}`
    : "#servicos";
  const profileUrl = `https://www.aurameets.com.br/terapeuta/${therapist.slug}`;
  const shareHref = `https://wa.me/?text=${encodeURIComponent(`Conheça o perfil profissional de ${name} no AuraMeets: ${profileUrl}`)}`;

  const actions: { label: string; icon: IconName; href: string; featured?: boolean }[] = [
    { label: "Quero agendar", icon: "calendar", href: scheduleHref, featured: true },
    { label: "Quero comprar", icon: "bag", href: "#servicos" },
  ];

  return (
    <main className="min-h-screen bg-[#080709] text-white selection:bg-[#d3b35a] selection:text-[#130d16]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(145,63,156,0.38),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(212,178,79,0.18),transparent_27%),linear-gradient(145deg,#080709_10%,#171019_55%,#09070a_100%)]" />
        <div className="absolute -left-28 top-24 h-72 w-72 rounded-full border border-[#d6b85a]/10" />
        <div className="absolute -left-16 top-36 h-52 w-52 rounded-full border border-[#d6b85a]/10" />

        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 lg:pb-16">
          <div className="mb-10 flex items-center justify-between">
            <a href="#" className="flex items-center gap-3" aria-label="AuraMeets">
              <span className="grid h-11 w-11 place-items-center rounded-2xl border border-[#d7ba61]/40 bg-[#702a78]/60 text-[#e5cc78] shadow-[0_0_30px_rgba(140,51,151,0.25)]">
                <span className="text-xl">◇</span>
              </span>
              <span>
                <strong className="block font-serif text-2xl tracking-wide text-[#e2c66e]">AuraMeets</strong>
                <small className="block text-[8px] uppercase tracking-[0.3em] text-white/55">Conexões que transformam</small>
              </span>
            </a>

            <a href={shareHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur transition hover:border-[#d7ba61]/60 hover:text-[#e5cc78]">
              <Icon name="share" className="h-4 w-4" />
              <span className="hidden sm:inline">Compartilhar perfil</span>
            </a>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-[260px_1fr] lg:gap-14">
            <div className="mx-auto md:mx-0">
              <div className="relative h-52 w-52 sm:h-60 sm:w-60">
                <div className="absolute inset-0 rounded-[2.4rem] bg-gradient-to-br from-[#e2c66e] via-[#7f327f] to-[#251129] p-[2px] shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
                  <div className="grid h-full w-full place-items-center overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#2a172d] to-[#0e0a10]">
                    {photo ? (
                      <img src={photo} alt={`Foto profissional de ${name}`} className="h-full w-full object-cover object-top" />
                    ) : (
                      <span className="font-serif text-6xl text-[#e4ca78]">{getInitials(name)}</span>
                    )}
                  </div>
                </div>
                <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#d9bd66]/40 bg-[#171019] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#e2c66e] shadow-xl">
                  <Icon name="check" className="h-3.5 w-3.5" /> Profissional verificada
                </span>
              </div>
            </div>

            <div className="text-center md:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d6b85e]">Perfil profissional AuraMeets</p>
              <h1 className="font-serif text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">{name}</h1>
              <p className="mt-4 text-base font-semibold text-[#c78dcc] sm:text-lg">{headline}</p>
              <div className="mx-auto mt-4 max-w-2xl md:mx-0">
                <ExpandableText
                  text={therapist.bio || "Conheça este profissional e encontre a experiência ideal para o seu momento."}
                  className="text-sm leading-7 text-white/58 sm:text-base"
                />
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                {[therapist.service_type, location].filter(Boolean).map((item) => <span key={String(item)} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-1 max-w-6xl px-5 sm:px-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 rounded-[2rem] border border-white/10 bg-[#100d12]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:grid-cols-2">
          {actions.map((action) => (
            <Link key={action.label} href={action.href} target={action.href.startsWith("http") ? "_blank" : undefined} className={`group flex min-h-32 flex-col items-center justify-center gap-4 rounded-[1.5rem] border px-5 text-center transition duration-300 hover:-translate-y-1 sm:min-h-36 ${action.featured ? "border-[#d4b452]/60 bg-gradient-to-br from-[#813587] to-[#542058] shadow-[0_12px_30px_rgba(108,38,116,0.3)]" : "border-[#d4b452]/35 bg-gradient-to-br from-[#261529] to-[#151017] shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:border-[#d4b452]/65"}`}>
              <Icon name={action.icon} className={`h-8 w-8 ${action.featured ? "text-[#f0da92]" : "text-[#d9bc62]"}`} />
              <span className="text-sm font-extrabold uppercase tracking-[0.11em] sm:text-base">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="servicos" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#cfae52]">Atendimentos e experiências</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">Serviços disponíveis</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/50">Escolha a experiência ideal para o seu momento e fale diretamente com a profissional.</p>
        </div>

        {services.length > 0 ? (
        <div className="grid gap-6">
          {services.map((service, index) => (
            <article key={service.id} className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#111014] transition duration-300 hover:-translate-y-1 hover:border-[#d1ae50]/35 lg:grid lg:grid-cols-5">
              <div className={`relative min-h-80 overflow-hidden bg-gradient-to-br lg:col-span-2 lg:min-h-full ${index % 3 === 0 ? "from-[#8d6a24] via-[#d8b95d] to-[#75500e]" : index % 3 === 1 ? "from-[#5d2469] via-[#a95bb2] to-[#33113c]" : "from-[#19394d] via-[#3f8191] to-[#10232d]"}`}>
                {service.cover_photo_url && (
                  <img
                    src={service.cover_photo_url}
                    alt={`Imagem de ${service.name}`}
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                )}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(255,255,255,0.26),transparent_26%),linear-gradient(0deg,rgba(5,5,7,0.45),transparent)]" />
                <div className="absolute bottom-4 left-5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">{service.category || "Serviço AuraMeets"}</div>
              </div>
              <div className="flex flex-col justify-between p-6 lg:col-span-3 lg:p-8">
                <h3 className="font-serif text-2xl text-white">{service.name}</h3>
                <div className="mt-3 min-h-[96px]">
                  <ExpandableText
                    text={service.description || "Conheça esta experiência oferecida pelo profissional."}
                    className="text-sm leading-6 text-white/55"
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/50">
                  {service.duration_minutes && <span className="rounded-full bg-white/[0.05] px-3 py-1.5">{service.duration_minutes} minutos</span>}
                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">{getModality(service)}</span>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/35">Investimento</span>
                    <strong className="mt-1 block text-xl text-[#e1c56d]">{formatCurrency(getFinalPrice(service), service.currency || "BRL")}</strong>
                  </div>
                  <Link href={`/comprar?servico=${encodeURIComponent(service.id)}`} className="rounded-full bg-[#7e327f] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#a24ba5]">Quero comprar</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        ) : (
          <div className="rounded-[1.7rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-white/50">Este profissional ainda não publicou serviços.</div>
        )}
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/35">AuraMeets · Conecta · Transforma · Realiza</footer>
    </main>
  );
}