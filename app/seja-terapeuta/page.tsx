import Link from "next/link";

const beneficios = [
  {
    titulo: "Perfil profissional",
    descricao:
      "Apresente sua trajetória, especialidades, terapias, formações e diferenciais em uma página profissional.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.1a7.5 7.5 0 0 1 15 0"
        />
      </svg>
    ),
  },
  {
    titulo: "Mais visibilidade",
    descricao:
      "Seja encontrado por pessoas que procuram exatamente o tipo de atendimento que você oferece.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12s3.75-6 9.75-6 9.75 6 9.75 6-3.75 6-9.75 6S2.25 12 2.25 12Z"
        />
        <circle cx="12" cy="12" r="2.75" />
      </svg>
    ),
  },
  {
    titulo: "Solicitações organizadas",
    descricao:
      "Receba e acompanhe solicitações de atendimento em um painel desenvolvido para sua rotina.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3.75 9h16.5M5.25 4.5h13.5A1.5 1.5 0 0 1 20.25 6v13.5H3.75V6a1.5 1.5 0 0 1 1.5-1.5Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m8.25 14.25 2.25 2.25 5.25-5.25"
        />
      </svg>
    ),
  },
  {
    titulo: "Comunidade profissional",
    descricao:
      "Faça parte de uma rede de terapeutas comprometidos com acolhimento, ética e transformação humana.",
    icone: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-7 w-7"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 18.75a6 6 0 0 0-9 0M12 13.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5ZM17.25 7.5a3 3 0 0 1 0 6M6.75 7.5a3 3 0 0 0 0 6"
        />
      </svg>
    ),
  },
];

const etapas = [
  {
    numero: "01",
    titulo: "Crie seu cadastro",
    descricao:
      "Informe seus dados profissionais e conte um pouco sobre sua trajetória.",
  },
  {
    numero: "02",
    titulo: "Apresente seu trabalho",
    descricao:
      "Adicione especialidades, terapias, formatos de atendimento e informações relevantes.",
  },
  {
    numero: "03",
    titulo: "Receba novas conexões",
    descricao:
      "Após a aprovação, seu perfil poderá conectar você a pessoas que buscam atendimento.",
  },
];

export default function SejaTerapeutaPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* MENU SUPERIOR */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Página inicial da AuraMeets"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300 text-xl font-black text-slate-950">
              A
            </div>

            <span className="text-xl font-bold tracking-wide sm:text-2xl">
              Aura<span className="text-amber-300">Meets</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <a
              href="#como-funciona"
              className="text-sm font-medium text-slate-300 transition hover:text-amber-300"
            >
              Como funciona
            </a>

            <a
              href="#beneficios"
              className="text-sm font-medium text-slate-300 transition hover:text-amber-300"
            >
              Benefícios
            </a>

            <a
              href="#fase-fundadora"
              className="text-sm font-medium text-slate-300 transition hover:text-amber-300"
            >
              Fase fundadora
            </a>

            <Link
              href="/login-terapeuta"
              className="text-sm font-medium text-slate-300 transition hover:text-amber-300"
            >
              Entrar
            </Link>
          </nav>

          <Link
            href="/cadastro-fundador"
            className="hidden rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200 sm:inline-flex"
          >
            Quero ser fundador
          </Link>

          <Link
            href="/cadastro-fundador"
            className="inline-flex rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-200 sm:hidden"
          >
            Cadastrar
          </Link>
        </div>

        {/* MENU PARA CELULAR */}
        <nav className="flex items-center gap-5 overflow-x-auto border-t border-white/5 px-5 py-3 lg:hidden">
          <a
            href="#como-funciona"
            className="shrink-0 text-sm font-medium text-slate-300 transition hover:text-amber-300"
          >
            Como funciona
          </a>

          <a
            href="#beneficios"
            className="shrink-0 text-sm font-medium text-slate-300 transition hover:text-amber-300"
          >
            Benefícios
          </a>

          <a
            href="#fase-fundadora"
            className="shrink-0 text-sm font-medium text-slate-300 transition hover:text-amber-300"
          >
            Fase fundadora
          </a>

          <Link
            href="/login-terapeuta"
            className="shrink-0 text-sm font-medium text-slate-300 transition hover:text-amber-300"
          >
            Entrar
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative border-b border-white/10 pt-32 lg:pt-20">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl sm:h-[560px] sm:w-[560px]" />
          <div className="absolute right-[-160px] top-48 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-28">
          <div className="text-center lg:text-left">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-300 lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Pré-lançamento para terapeutas fundadores
            </div>

            <h1 className="mt-7 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              Seu trabalho pode chegar a quem{" "}
              <span className="text-amber-300">realmente precisa.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg lg:mx-0 lg:text-xl">
              A AuraMeets conecta pessoas em busca de acolhimento e
              desenvolvimento humano a terapeutas preparados para transformar
              vidas.
            </p>

            <div className="mt-8 rounded-2xl border border-amber-300/20 bg-white/[0.04] p-5 text-left sm:p-6">
              <p className="text-base leading-7 text-slate-200 sm:text-lg">
                Os primeiros terapeutas selecionados poderão entrar na fase
                fundadora da plataforma{" "}
                <strong className="font-semibold text-amber-300">
                  sem custo inicial
                </strong>
                , contribuir com a evolução do projeto e construir presença
                desde o começo.
              </p>
            </div>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/cadastro-fundador"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-300 px-7 py-4 text-base font-bold text-slate-950 shadow-lg shadow-amber-300/10 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-300/30 sm:w-auto sm:text-lg"
              >
                Quero ser terapeuta fundador
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="ml-2 h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 18 6-6-6-6"
                  />
                </svg>
              </Link>

              <a
                href="#como-funciona"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-base font-semibold text-white transition hover:border-white/30 hover:bg-white/10 sm:w-auto sm:text-lg"
              >
                Entender como funciona
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Cadastro sujeito à análise durante a fase de pré-lançamento.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-7">
              <div className="absolute -right-1 -top-4 rounded-full border border-amber-300/30 bg-slate-950 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300 sm:right-5 sm:top-5">
                Vagas iniciais
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-xl font-black text-slate-950">
                    A
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      Plataforma profissional
                    </p>

                    <h2 className="text-xl font-bold sm:text-2xl">
                      AuraMeets para terapeutas
                    </h2>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    "Perfil profissional personalizado",
                    "Divulgação das suas especialidades",
                    "Recebimento de solicitações",
                    "Painel para gestão dos atendimentos",
                    "Participação na comunidade fundadora",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m5 12 4 4L19 6"
                          />
                        </svg>
                      </span>

                      <p className="text-sm leading-6 text-slate-300 sm:text-base">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5">
                  <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">
                    Condição de fundador
                  </p>

                  <p className="mt-2 text-lg font-bold text-white">
                    Entrada gratuita no pré-lançamento
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Uma oportunidade reservada aos primeiros profissionais
                    aprovados. Porque chegar cedo também é uma especialidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section
        id="beneficios"
        className="scroll-mt-32 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
            Estrutura para crescer
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Mais do que um perfil: uma nova forma de ser encontrado
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg">
            A AuraMeets está sendo construída para aproximar o público certo
            dos profissionais certos, com uma jornada simples, humana e
            organizada.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {beneficios.map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="group rounded-3xl border border-white/10 bg-slate-900/70 p-6 transition duration-200 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-slate-900"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-300 transition group-hover:bg-amber-300 group-hover:text-slate-950">
                {beneficio.icone}
              </div>

              <h3 className="mt-6 text-xl font-bold">{beneficio.titulo}</h3>

              <p className="mt-3 text-sm leading-7 text-slate-400 sm:text-base">
                {beneficio.descricao}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section
        id="como-funciona"
        className="scroll-mt-32 border-y border-white/10 bg-slate-900/50"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
                Como funciona
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Um processo simples para valorizar seu trabalho
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-400 sm:text-lg">
                Você apresenta sua atuação profissional, passa pela análise da
                equipe AuraMeets e começa a construir sua presença dentro da
                plataforma.
              </p>

              <Link
                href="/cadastro-fundador"
                className="mt-8 inline-flex items-center font-bold text-amber-300 transition hover:text-amber-200"
              >
                Começar meu cadastro
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="ml-2 h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m9 18 6-6-6-6"
                  />
                </svg>
              </Link>
            </div>

            <div className="space-y-5">
              {etapas.map((etapa) => (
                <article
                  key={etapa.numero}
                  className="flex gap-5 rounded-3xl border border-white/10 bg-slate-950/70 p-5 sm:gap-7 sm:p-7"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300 font-black text-slate-950 sm:h-14 sm:w-14">
                    {etapa.numero}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold sm:text-2xl">
                      {etapa.titulo}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-400 sm:text-base">
                      {etapa.descricao}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FASE FUNDADORA */}
      <section
        id="fase-fundadora"
        className="scroll-mt-32 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="overflow-hidden rounded-[2rem] border border-amber-300/20 bg-gradient-to-br from-amber-300/15 via-slate-900 to-slate-900 p-7 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
                Faça parte desde o início
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Os primeiros terapeutas não serão apenas usuários. Serão parte
                da história.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
                Durante o pré-lançamento, os profissionais fundadores poderão
                conhecer a plataforma, testar os recursos e contribuir para que
                a experiência seja cada vez mais eficiente e humana.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-7 text-center lg:w-64">
              <p className="text-5xl font-black text-amber-300 sm:text-6xl">
                100
              </p>

              <p className="mt-2 text-base font-semibold text-white">
                terapeutas fundadores
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Vagas iniciais sujeitas à aprovação.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FRASE */}
      <section className="border-y border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mx-auto h-10 w-10 text-amber-300/70"
            aria-hidden="true"
          >
            <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V18h7v-7H5.12A2.17 2.17 0 0 1 7.17 9H9V6H7.17Zm10 0A5.17 5.17 0 0 0 12 11.17V18h7v-7h-3.88A2.17 2.17 0 0 1 17.17 9H19V6h-1.83Z" />
          </svg>

          <blockquote className="mt-7 text-2xl font-medium leading-relaxed text-slate-200 sm:text-3xl lg:text-4xl">
            “A AuraMeets nasceu para aproximar pessoas de profissionais que
            realmente transformam vidas.”
          </blockquote>

          <div className="mt-8">
            <p className="font-bold text-amber-300">Oscar Ahumada</p>
            <p className="mt-1 text-sm text-slate-500">
              Fundador da AuraMeets
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute bottom-[-150px] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 sm:py-28">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-amber-300">
            Sua presença começa aqui
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Pronto para apresentar seu trabalho a novas pessoas?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
            Preencha seu cadastro profissional e candidate-se para fazer parte
            do grupo inicial de terapeutas fundadores da AuraMeets.
          </p>

          <Link
            href="/cadastro-fundador"
            className="mt-9 inline-flex w-full items-center justify-center rounded-2xl bg-amber-300 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-amber-300/10 transition duration-200 hover:-translate-y-0.5 hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-300/30 sm:w-auto sm:text-lg"
          >
            Criar meu perfil de fundador
          </Link>

          <p className="mt-5 text-sm text-slate-500">
            O cadastro não garante aprovação automática.
          </p>
        </div>
      </section>
    </main>
  );
}