import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatPhone } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
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
  if (valor === null || valor === undefined) return "0,0";

  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function criarLinkWhatsApp(telefone: string | null, nome: string) {
  if (!telefone) return null;

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
  if (!instagram) return null;

  if (instagram.startsWith("http://") || instagram.startsWith("https://")) {
    return instagram;
  }

  return `https://instagram.com/${instagram.replace("@", "").trim()}`;
}

function normalizarWebsite(website: string | null) {
  if (!website) return null;

  if (website.startsWith("http://") || website.startsWith("https://")) {
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
  const whatsappUrl = criarLinkWhatsApp(therapist.phone, nome);
  const instagramUrl = normalizarInstagram(therapist.instagram);
  const websiteUrl = normalizarWebsite(therapist.website);

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="text-2xl font-black text-yellow-400">
            AuraMeets
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-700 px-5 py-3 font-bold transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Página inicial
          </Link>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_360px] lg:py-16">
        <div>
          <div className="flex flex-col gap-7 sm:flex-row">
            {therapist.photo_url ? (
              <img
                src={therapist.photo_url}
                alt={`Foto profissional de ${nome}`}
                className="h-44 w-44 rounded-3xl border border-yellow-400/30 object-cover"
              />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-3xl border border-yellow-400/30 bg-[#111A33] text-6xl font-black text-yellow-400">
                {nome.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                  Perfil profissional
                </p>

                {therapist.verified && (
                  <span className="rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-400">
                    Perfil verificado
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-4xl font-black sm:text-5xl">{nome}</h1>

              <p className="mt-4 text-xl font-bold text-slate-200">
                {therapist.speciality || "Especialidade não informada"}
              </p>

              <p className="mt-3 text-lg text-slate-400">
                {[therapist.city, therapist.state].filter(Boolean).join(" • ")}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-[#111A33] px-4 py-2 font-black text-yellow-400">
                  ★ {formatarAvaliacao(therapist.rating)}
                </span>

                <span className="rounded-full bg-[#111A33] px-4 py-2 font-semibold text-slate-300">
                  {therapist.service_type || "Modalidade não informada"}
                </span>

                {therapist.plan && (
                  <span className="rounded-full bg-[#111A33] px-4 py-2 font-semibold capitalize text-slate-300">
                    Plano {therapist.plan}
                  </span>
                )}
              </div>
            </div>
          </div>

          <article className="mt-10 rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Sobre o profissional
            </p>

            <p className="mt-5 whitespace-pre-line text-lg leading-8 text-slate-300">
              {therapist.bio || "Biografia ainda não cadastrada."}
            </p>
          </article>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
              <p className="text-sm text-slate-500">Atendimento</p>
              <p className="mt-3 text-xl font-black">
                {therapist.service_type || "Não informado"}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
              <p className="text-sm text-slate-500">Duração</p>
              <p className="mt-3 text-xl font-black">
                {therapist.duration || "Não informada"}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
              <p className="text-sm text-slate-500">Experiência</p>
              <p className="mt-3 text-xl font-black">
                {therapist.experience || "Não informada"}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-[#111A33] p-6">
              <p className="text-sm text-slate-500">Avaliação</p>
              <p className="mt-3 text-xl font-black text-yellow-400">
                ★ {formatarAvaliacao(therapist.rating)}
              </p>
            </article>
          </div>

          {(instagramUrl || websiteUrl) && (
            <article className="mt-8 rounded-3xl border border-slate-800 bg-[#111A33] p-6 sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Presença digital
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 px-6 py-4 text-center font-black hover:border-yellow-400 hover:text-yellow-400"
                  >
                    Instagram
                  </a>
                )}

                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-700 px-6 py-4 text-center font-black hover:border-yellow-400 hover:text-yellow-400"
                  >
                    Site profissional
                  </a>
                )}
              </div>
            </article>
          )}
        </div>

        <aside className="lg:sticky lg:top-6">
          <div className="rounded-3xl border border-yellow-400/30 bg-[#111A33] p-6 shadow-2xl sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Consulta particular
            </p>

            <p className="mt-6 text-sm text-slate-500">Valor da consulta</p>

            <p className="mt-2 text-4xl font-black">
              {therapist.price !== null
                ? formatCurrency(therapist.price)
                : "Sob consulta"}
            </p>

            <div className="mt-7 space-y-4 border-t border-slate-800 pt-6">
              <div>
                <p className="text-sm text-slate-500">Duração</p>
                <p className="mt-1 font-bold">
                  {therapist.duration || "Não informada"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Modalidade</p>
                <p className="mt-1 font-bold">
                  {therapist.service_type || "Não informada"}
                </p>
              </div>

              {therapist.phone && (
                <div>
                  <p className="text-sm text-slate-500">WhatsApp</p>
                  <p className="mt-1 font-bold">
                    {formatPhone(therapist.phone)}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-xl bg-yellow-400 px-6 py-4 text-lg font-black text-black hover:bg-yellow-300"
            >
              Agendar consulta
            </button>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block w-full rounded-xl border border-emerald-400/50 bg-emerald-400/10 px-6 py-4 text-center font-black text-emerald-300 hover:bg-emerald-400 hover:text-black"
              >
                Conversar pelo WhatsApp
              </a>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}