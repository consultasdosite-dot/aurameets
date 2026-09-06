"use client";

import { useState } from "react";

type IconName = "calendar" | "bag" | "gift" | "ticket" | "share" | "check";

const services = [
  {
    id: 1,
    category: "Atendimento individual",
    title: "Clareza e Direção",
    description:
      "Um encontro acolhedor para compreender o momento atual, organizar emoções e encontrar novos caminhos.",
    duration: "60 minutos",
    modality: "Online ou presencial",
    price: "R$ 180,00",
    accent: "from-[#8d6a24] via-[#d8b95d] to-[#75500e]",
  },
  {
    id: 2,
    category: "Mentoria",
    title: "Jornada de Autoconhecimento",
    description:
      "Acompanhamento personalizado para fortalecer escolhas, propósito e equilíbrio emocional.",
    duration: "4 encontros",
    modality: "Online",
    price: "R$ 620,00",
    accent: "from-[#5d2469] via-[#a95bb2] to-[#33113c]",
  },
  {
    id: 3,
    category: "Conteúdo digital",
    title: "Meditação para Recomeços",
    description:
      "Vídeo guiado para desacelerar, renovar a energia e iniciar um novo ciclo com mais presença.",
    duration: "25 minutos",
    modality: "Acesso digital",
    price: "R$ 47,00",
    accent: "from-[#19394d] via-[#3f8191] to-[#10232d]",
  },
];

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

const actions: { label: string; icon: IconName; href: string; featured?: boolean }[] = [
  { label: "Quero agendar", icon: "calendar", href: "#servicos", featured: true },
  { label: "Quero comprar", icon: "bag", href: "#servicos" },
  { label: "Quero presente", icon: "gift", href: "#presente" },
  { label: "Quero cupom", icon: "ticket", href: "#cupom" },
];

export default function PerfilTestePage() {
  const [shared, setShared] = useState(false);

  async function shareProfile() {
    const data = {
      title: "Alzira Inamine Shimizo | AuraMeets",
      text: "Conheça meu perfil profissional no AuraMeets.",
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(data);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setShared(true);
    window.setTimeout(() => setShared(false), 2200);
  }

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

            <button onClick={shareProfile} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/80 backdrop-blur transition hover:border-[#d7ba61]/60 hover:text-[#e5cc78]">
              <Icon name="share" className="h-4 w-4" />
              <span className="hidden sm:inline">{shared ? "Link copiado" : "Compartilhar perfil"}</span>
            </button>
          </div>

          <div className="grid items-center gap-8 md:grid-cols-[260px_1fr] lg:gap-14">
            <div className="mx-auto md:mx-0">
              <div className="relative h-52 w-52 sm:h-60 sm:w-60">
                <div className="absolute inset-0 rounded-[2.4rem] bg-gradient-to-br from-[#e2c66e] via-[#7f327f] to-[#251129] p-[2px] shadow-[0_25px_70px_rgba(0,0,0,0.5)]">
                  <div className="grid h-full w-full place-items-center overflow-hidden rounded-[2.3rem] bg-gradient-to-br from-[#2a172d] to-[#0e0a10]">
                    <div className="text-center">
                      <span className="block font-serif text-6xl text-[#e4ca78]">AS</span>
                      <span className="mt-2 block text-[9px] uppercase tracking-[0.28em] text-white/40">Foto profissional</span>
                    </div>
                  </div>
                </div>
                <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#d9bd66]/40 bg-[#171019] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#e2c66e] shadow-xl">
                  <Icon name="check" className="h-3.5 w-3.5" /> Profissional verificada
                </span>
              </div>
            </div>

            <div className="text-center md:text-left">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#d6b85e]">Perfil profissional AuraMeets</p>
              <h1 className="font-serif text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">Alzira Inamine <span className="block text-[#c78dcc]">Shimizo</span></h1>
              <p className="mt-4 text-base font-semibold text-white/75 sm:text-lg">Terapeuta Holística e Psicanalista Espiritualista</p>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/58 md:mx-0 sm:text-base">Acolhimento, escuta e terapias integrativas para promover equilíbrio emocional, autoconhecimento e expansão da consciência.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                {["Atendimento online", "Atendimento presencial", "São Paulo, SP"].map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60">{item}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-1 max-w-6xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-[2rem] border border-white/10 bg-[#100d12]/90 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:grid-cols-4">
          {actions.map((action) => (
            <a key={action.label} href={action.href} className={`group flex min-h-28 flex-col items-center justify-center gap-3 rounded-[1.35rem] border px-3 text-center transition duration-300 hover:-translate-y-1 ${action.featured ? "border-[#d4b452]/60 bg-gradient-to-br from-[#813587] to-[#542058] shadow-[0_12px_30px_rgba(108,38,116,0.3)]" : "border-white/10 bg-white/[0.04] hover:border-[#d4b452]/45 hover:bg-white/[0.07]"}`}>
              <Icon name={action.icon} className={`h-7 w-7 ${action.featured ? "text-[#f0da92]" : "text-[#c98dce] group-hover:text-[#e1c66f]"}`} />
              <span className="text-xs font-extrabold uppercase tracking-[0.09em] sm:text-sm">{action.label}</span>
            </a>
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

        <div className="grid gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <article key={service.id} className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#111014] transition duration-300 hover:-translate-y-1 hover:border-[#d1ae50]/35">
              <div className={`relative h-36 bg-gradient-to-br ${service.accent}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(255,255,255,0.26),transparent_26%),linear-gradient(0deg,rgba(5,5,7,0.45),transparent)]" />
                <div className="absolute bottom-4 left-5 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur">{service.category}</div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl text-white">{service.title}</h3>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-white/55">{service.description}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/50">
                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">{service.duration}</span>
                  <span className="rounded-full bg-white/[0.05] px-3 py-1.5">{service.modality}</span>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                  <div>
                    <span className="block text-[10px] uppercase tracking-widest text-white/35">Investimento</span>
                    <strong className="mt-1 block text-xl text-[#e1c56d]">{service.price}</strong>
                  </div>
                  <button className="rounded-full bg-[#7e327f] px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#a24ba5]">Quero comprar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="presente" className="border-y border-white/10 bg-gradient-to-r from-[#160f19] via-[#25132a] to-[#160f19] px-5 py-12 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d6b85e]">Uma experiência para alguém especial</p>
        <h2 className="mt-3 font-serif text-3xl">Também pode ser presente</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">Escolha um serviço e envie uma experiência de cuidado, acolhimento e transformação.</p>
        <a href="#servicos" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d5b75b]/45 bg-[#d1ae50] px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#1b111d] transition hover:bg-[#edd685]"><Icon name="gift" className="h-4 w-4" /> Quero presente</a>
      </section>

      <section id="cupom" className="mx-auto max-w-6xl px-5 py-14 text-center sm:px-8">
        <div className="rounded-[2rem] border border-dashed border-[#c99e3e]/45 bg-[#d0aa45]/[0.06] px-6 py-9">
          <Icon name="ticket" className="mx-auto h-8 w-8 text-[#e1c56d]" />
          <h2 className="mt-3 font-serif text-3xl">Cupom especial</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55">Solicite o cupom disponível diretamente com a profissional e aproveite a condição especial.</p>
          <button className="mt-6 rounded-full bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-wider text-[#271629] transition hover:bg-[#ead98e]">Quero meu cupom</button>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-white/35">AuraMeets · Conecta · Transforma · Realiza</footer>
    </main>
  );
}
