import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatPhone } from "@/lib/utils";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

type Therapist = {
  id: number;
  name: string | null;
  phone: string | null;
  speciality: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  photo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  price: number | null;
  active: boolean | null;
  service_type: string | null;
  instagram: string | null;
  website: string | null;
  plan: string | null;
  duration: string | null;
  experience: string | null;
  slug: string | null;
};

function formatarAvaliacao(valor: number | null) {
  if (valor === null || valor === undefined) {
    return "0,0";
  }

  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function criarLinkWhatsApp(telefone: string | null, nome: string) {
  if (!telefone) {
    return null;
  }

  let numeros = telefone.replace(/\D/g, "");

  if (!numeros.startsWith("55")) {
    numeros = `55${numeros}`;
  }

  const mensagem = encodeURIComponent(
    `Olá! Encontrei o perfil de ${nome} no AuraMeets e gostaria de saber mais sobre o atendimento.`,
  );

  return `https://wa.me/${numeros}?text=${mensagem}`;
}

function normalizarInstagram(instagram: string | null) {
  if (!instagram) {
    return null;
  }

  if (
    instagram.startsWith("http://") ||
    instagram.startsWith("https://")
  ) {
    return instagram;
  }

  const usuario = instagram.replace("@", "").trim();

  if (!usuario) {
    return null;
  }

  return `https://instagram.com/${usuario}`;
}

function normalizarWebsite(website: string | null) {
  if (!website) {
    return null;
  }

  if (
    website.startsWith("http://") ||
    website.startsWith("https://")
  ) {
    return website;
  }

  return `https://${website}`;
}

export default async function TherapistPage({ params }: Props) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("therapists")
    .select(
      `
        id,
        name,
        phone,
        speciality,
        city,
        state,
        bio,
        photo_url,
        verified,
        rating,
        price,
        active,
        service_type,
        instagram,
        website,
        plan,
        duration,
        experience,
        slug
      `,
    )
    .eq("slug", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao carregar terapeuta:", error);
    notFound();
  }

  if (!data) {
    notFound();
  }

  const therapist = data as Therapist;

  const nome = therapist.name || "Profissional AuraMeets";

  const especialidade =
    therapist.speciality || "Especialidade não informada";

  const localizacao =
    [therapist.city, therapist.state]
      .filter(Boolean)
      .join(" • ") || "Atendimento online";

  const whatsappUrl = criarLinkWhatsApp(
    therapist.phone,
    nome,
  );

  const instagramUrl = normalizarInstagram(
    therapist.instagram,
  );

  const websiteUrl = normalizarWebsite(
    therapist.website,
  );

  return (
    <main className="min-h-screen bg-[#050816] pb-24 text-white lg:pb-0">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#050816]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-yellow-400"
          >
            AuraMeets
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden px-4 py-3 font-bold text-slate-300 transition hover:text-yellow-400 sm:block"
            >
              Página inicial
            </Link>

            <Link
              href="/planos"
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold transition hover:border-yellow-400 hover:text-yellow-400 sm:px-5 sm:text-base"
            >
              Conhecer o AuraMeets
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:py-20">
          <div>
            <div className="flex flex-col gap-8 md:flex-row md:items-center">
              <div className="shrink-0">
                {therapist.photo_url ? (
                  <img
                    src={therapist.photo_url}
                    alt={`Foto profissional de ${nome}`}
                    className="h-48 w-48 rounded-[2rem] border-2 border-yellow-400/30 object-cover shadow-2xl sm:h-56 sm:w-56"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-[2rem] border-2 border-yellow-400/30 bg-[#111A33] text-7xl font-black text-yellow-400 shadow-2xl sm:h-56 sm:w-56">
                    {nome.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 sm:text-sm">
                    Perfil profissional
                  </p>

                  {therapist.verified && (
                    <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 text-xs font-black text-yellow-400">
                      ✓ Perfil verificado
                    </span>
                  )}

                  {therapist.plan && (
                    <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-3 py-1.5 text-xs font-black capitalize text-purple-300">
                      Plano {therapist.plan}
                    </span>
                  )}
                </div>

                <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  {nome}
                </h1>

                <p className="mt-4 text-xl font-black text-slate-100 sm:text-2xl">
                  {especialidade}
                </p>

                <p className="mt-3 text-lg text-slate-400">
                  {localizacao}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full border border-slate-700 bg-[#111A33] px-4 py-2 font-black text-yellow-400">
                    ★ {formatarAvaliacao(therapist.rating)}
                  </span>

                  <span className="rounded-full border border-slate-700 bg-[#111A33] px-4 py-2 font-semibold text-slate-300">
                    {therapist.service_type ||
                      "Modalidade não informada"}
                  </span>

                  {therapist.experience && (
                    <span className="rounded-full border border-slate-700 bg-[#111A33] px-4 py-2 font-semibold text-slate-300">
                      {therapist.experience}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <article className="mt-10 rounded-3xl border border-slate-800 bg-[#111A33] p-6 shadow-xl sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Sobre o profissional
              </p>

              <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-300 sm:text-lg">
                {therapist.bio ||
                  "Este profissional ainda não adicionou sua apresentação."}
              </p>
            </article>

            <section className="mt-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Informações do atendimento
              </p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl text-black">
                    ◉
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Modalidade
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {therapist.service_type || "Não informada"}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl text-black">
                    ⏱
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Duração da consulta
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {therapist.duration || "Não informada"}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl text-black">
                    ★
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Avaliação
                  </p>

                  <p className="mt-2 text-xl font-black text-yellow-400">
                    {formatarAvaliacao(therapist.rating)}
                  </p>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl text-black">
                    ◈
                  </div>

                  <p className="mt-5 text-sm font-semibold text-slate-500">
                    Experiência profissional
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {therapist.experience || "Não informada"}
                  </p>
                </article>
              </div>
            </section>

            {(instagramUrl || websiteUrl) && (
              <article className="mt-8 rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                  Presença digital
                </p>

                <p className="mt-3 text-slate-400">
                  Conheça mais sobre o trabalho deste profissional.
                </p>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-700 px-6 py-4 text-center font-black transition hover:border-yellow-400 hover:text-yellow-400"
                    >
                      Instagram
                    </a>
                  )}

                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-700 px-6 py-4 text-center font-black transition hover:border-yellow-400 hover:text-yellow-400"
                    >
                      Site profissional
                    </a>
                  )}
                </div>
              </article>
            )}

            <article className="mt-8 rounded-3xl border border-yellow-400/20 bg-yellow-400/5 p-6 sm:p-8">
              <p className="text-lg font-black text-yellow-400">
                Encontre clareza para o seu momento.
              </p>

              <p className="mt-3 max-w-3xl leading-7 text-slate-300">
                Entre em contato com o profissional para esclarecer suas
                dúvidas, conhecer a metodologia de atendimento e verificar os
                horários disponíveis.
              </p>
            </article>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-yellow-400/30 bg-[#111A33] shadow-2xl">
              <div className="bg-yellow-400 px-6 py-4 text-black">
                <p className="text-xs font-black uppercase tracking-[0.25em]">
                  Consulta particular
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-sm font-semibold text-slate-500">
                  Valor da consulta
                </p>

                <p className="mt-2 text-4xl font-black text-white">
                  {therapist.price !== null
                    ? formatCurrency(therapist.price)
                    : "Sob consulta"}
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Confirme diretamente com o profissional as condições de
                  pagamento.
                </p>

                <div className="mt-7 space-y-5 border-t border-slate-800 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      Duração
                    </p>

                    <p className="text-right font-bold">
                      {therapist.duration || "Não informada"}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      Atendimento
                    </p>

                    <p className="text-right font-bold">
                      {therapist.service_type || "Não informado"}
                    </p>
                  </div>

                  {therapist.phone && (
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-slate-500">
                        WhatsApp
                      </p>

                      <p className="text-right font-bold">
                        {formatPhone(therapist.phone)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-slate-500">
                      Avaliação
                    </p>

                    <p className="text-right font-black text-yellow-400">
                      ★ {formatarAvaliacao(therapist.rating)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
                >
                  Agendar consulta
                </button>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 block w-full rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-6 py-4 text-center font-black text-emerald-300 transition hover:bg-emerald-400 hover:text-black"
                  >
                    Conversar pelo WhatsApp
                  </a>
                )}

                <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                  O agendamento online será disponibilizado em uma próxima
                  etapa.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-[#080D22] p-5">
              <p className="text-sm font-black text-yellow-400">
                Rede AuraMeets
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Este profissional faz parte da rede AuraMeets. Verifique
                diretamente as condições e informações do atendimento.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-center text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© 2026 AuraMeets. Todos os direitos reservados.</p>

          <Link
            href="/"
            className="font-bold text-yellow-400 hover:underline"
          >
            Conheça o AuraMeets
          </Link>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-700 bg-[#111A33]/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-4 py-3 text-center text-sm font-black text-emerald-300"
            >
              WhatsApp
            </a>
          )}

          <button
            type="button"
            className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black"
          >
            Agendar
          </button>
        </div>
      </div>
    </main>
  );
}