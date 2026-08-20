import Link from "next/link";


type PublicTherapist = {
  name: string;
  slug: string;
  profile_photo_url: string | null;
  photo_url: string | null;
  speciality: string | null;
};

type Professional = {
  name: string;
  role: string;
  image: string | null;
  slug: string | null;
  initials: string;
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

async function getProfessionalProfile({
  slug,
  namePrefix,
}: {
  slug?: string;
  namePrefix?: string;
}): Promise<PublicTherapist | null> {
  const { supabaseUrl, supabasePublicKey } =
    getSupabasePublicConfig();

  if (!supabaseUrl || !supabasePublicKey) {
    return null;
  }

  const query = new URLSearchParams({
    select:
      "name,slug,profile_photo_url,photo_url,speciality",
    active: "eq.true",
    limit: "1",
  });

  if (slug) {
    query.set("slug", `eq.${slug}`);
  } else if (namePrefix) {
    query.set("name", `ilike.${namePrefix}%`);
  } else {
    return null;
  }

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
        "Não foi possível carregar profissional da área Empresas:",
        await response.text(),
      );
      return null;
    }

    const data = (await response.json()) as PublicTherapist[];
    return data[0] ?? null;
  } catch (error) {
    console.error(
      "Erro ao carregar profissional da área Empresas:",
      error,
    );
    return null;
  }
}

function getPhoto(
  therapist: PublicTherapist | null,
) {
  return (
    therapist?.profile_photo_url?.trim() ||
    therapist?.photo_url?.trim() ||
    null
  );
}


export default async function EmpresaPage() {
  const [naysaProfile, oscarProfile] = await Promise.all([
    getProfessionalProfile({
      namePrefix: "Naysa Lima",
    }),
    getProfessionalProfile({
      slug: "oscar-ahumada",
    }),
  ]);

  const professionals: Professional[] = [
    {
      name: naysaProfile?.name || "Naysa Lima",
      role: "Desenvolvimento humano e organizações",
      image: getPhoto(naysaProfile),
      slug: naysaProfile?.slug || null,
      initials: "NL",
    },
    {
      name: oscarProfile?.name || "Oscar Ahumada",
      role: "Numerologia Empresarial",
      image: getPhoto(oscarProfile),
      slug: oscarProfile?.slug || "oscar-ahumada",
      initials: "OA",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/10 bg-[#050816]/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-yellow-400"
          >
            AuraMeets
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400 sm:px-5 sm:text-base"
          >
            Voltar para a Home
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.22),transparent_38%),linear-gradient(180deg,#070b1d_0%,#050816_100%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:py-14">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-yellow-400/25 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
              AuraMeets para empresas
            </span>

            <h1 className="mt-5 text-4xl font-black leading-[1.08] sm:text-5xl lg:text-[3.35rem]">
              Pessoas, estrutura, desenvolvimento e bem-estar.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Uma nova forma de observar sua empresa, compreender pontos de
              atenção e conectar sua organização a profissionais e soluções
              voltadas ao desenvolvimento humano.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#mapeamento"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-yellow-400 px-6 py-4 text-center text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-yellow-300 sm:text-base"
              >
                MAPEAMENTO INICIAL GRATUITO
              </a>

              <a
                href="#numerologia"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-purple-400/50 bg-purple-500/10 px-6 py-4 text-center text-sm font-black text-purple-200 transition hover:border-purple-300 hover:bg-purple-500/20 sm:text-base"
              >
                CONSULTA NUMEROLÓGICA EMPRESARIAL
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:-translate-y-1">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#111936] via-[#10162b] to-[#1c1230] p-5 shadow-2xl shadow-purple-950/40 sm:p-7">
              <p className="text-center text-xs font-black uppercase tracking-[0.22em] text-purple-300">
                AuraMeets Empresas
              </p>

              <h2 className="mx-auto mt-3 max-w-md text-center text-2xl font-black leading-snug sm:text-[2rem]">
                Uma primeira leitura para compreender onde sua empresa pode
                estar perdendo força, clareza e potencial.
              </h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm font-black text-yellow-400">
                    Estrutura
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Liderança, comunicação, processos, direção e crescimento.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <p className="text-sm font-black text-purple-300">
                    Pessoas
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Cultura, relações, confiança, clareza e desenvolvimento.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.06] p-4 text-center">
                <p className="text-sm font-bold text-yellow-400">
                  Uma ferramenta simples, rápida e visual.
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-300">
                  Para enxergar o que merece ser observado antes do próximo
                  passo da empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="mapeamento"
        className="border-y border-white/10 bg-[#090F20]"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-yellow-400">
              Mapeamento Inicial Gratuito
            </p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Um primeiro olhar para sua empresa.
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Responda a perguntas simples sobre o dia a dia da organização.
              Ao final, você receberá um mapa inicial com possíveis pontos de
              atenção, áreas que merecem ser observadas e um primeiro movimento.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              {
                title: "Rápido",
                text: "Perguntas objetivas, uma por vez, sem linguagem técnica.",
              },
              {
                title: "Personalizado",
                text: "A leitura considera suas respostas e o momento da empresa.",
              },
              {
                title: "Útil",
                text: "Você recebe clareza sobre o que merece atenção agora.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center"
              >
                <h3 className="text-xl font-black text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {item.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-xl text-center">
            <Link
              href="/empresas/mapeamento"
              className="inline-flex min-h-16 w-full items-center justify-center rounded-2xl bg-yellow-400 px-7 py-4 text-center text-lg font-black text-slate-950 shadow-[0_12px_30px_rgba(250,204,21,0.15)] transition hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              FAZER MEU MAPEAMENTO GRATUITO
            </Link>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              O Mapeamento Inicial Gratuito é uma ferramenta de percepção e não
              substitui uma análise empresarial completa ou consultoria
              especializada.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-purple-300">
            Profissionais responsáveis
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Pessoas por trás desta experiência
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-400">
            O AuraMeets Empresas conecta tecnologia, leitura humana e
            profissionais com experiência em desenvolvimento e análise
            empresarial.
          </p>
        </div>

        <div className="mx-auto mt-9 grid max-w-3xl gap-5 sm:grid-cols-2">
          {professionals.map((professional, index) => (
            <article
              key={professional.name}
              className="group rounded-[28px] border border-white/10 bg-[#10182D] p-5 text-center shadow-xl transition hover:-translate-y-1 hover:border-purple-400/30 sm:p-6"
            >
              <div
                className={`relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 bg-[#18223D] shadow-xl ${
                  index === 0
                    ? "border-purple-400/35"
                    : "border-yellow-400/35"
                }`}
              >
                {professional.image ? (
                  <img
                    src={professional.image}
                    alt={`Foto de ${professional.name}`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-yellow-400">
                    {professional.initials}
                  </div>
                )}
              </div>

              <h3 className="mt-5 text-2xl font-black text-white">
                {professional.name}
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-400">
                {professional.role}
              </p>

              {professional.slug && (
                <Link
                  href={`/terapeutas/${professional.slug}`}
                  className="mt-5 inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-black text-purple-200 transition hover:border-purple-400/50 hover:bg-purple-500/10"
                >
                  CONHECER PERFIL
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        id="numerologia"
        className="border-y border-purple-400/10 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_45%),#090F20]"
      >
        <div className="mx-auto max-w-5xl px-5 py-14 text-center sm:px-8 sm:py-18">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-purple-300">
            Análise complementar
          </p>

          <h2 className="mt-4 text-3xl font-black sm:text-4xl">
            Consulta Numerológica Empresarial
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Uma leitura aprofundada da identidade e do potencial da empresa por
            meio da Numerologia Empresarial, considerando nome, data de início e
            outros elementos da organização.
          </p>

          <Link
            href="/empresas/numerologia"
            className="mt-8 inline-flex min-h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-8 py-4 text-lg font-black text-white shadow-[0_12px_30px_rgba(147,51,234,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            QUERO MINHA CONSULTA NUMEROLÓGICA
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-sm leading-6 text-slate-500">
            AuraMeets Empresas — uma ponte entre pessoas, estrutura,
            desenvolvimento e bem-estar.
          </p>
        </div>
      </section>
    </main>
  );
}