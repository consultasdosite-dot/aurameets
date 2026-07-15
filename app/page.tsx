import Image from "next/image";
import Link from "next/link";

const benefits = [
  {
    number: "01",
    title: "Acesso antecipado",
    description:
      "Conheça o AuraMeets antes do lançamento oficial e acompanhe sua evolução desde o início.",
  },
  {
    number: "02",
    title: "Sua opinião terá voz",
    description:
      "Compartilhe percepções, sugestões e necessidades reais da sua rotina profissional.",
  },
  {
    number: "03",
    title: "Perfil com prioridade",
    description:
      "Os Cofundadores estarão entre os primeiros profissionais apresentados aos futuros usuários.",
  },
  {
    number: "04",
    title: "Reconhecimento fundador",
    description:
      "Faça parte do grupo pioneiro que ajudará a construir a primeira versão oficial do AuraMeets.",
  },
];

const steps = [
  {
    number: "1",
    title: "Solicite sua participação",
    description:
      "Preencha seus dados profissionais e apresente brevemente o seu trabalho.",
  },
  {
    number: "2",
    title: "Conheça a plataforma",
    description:
      "Acesse os primeiros recursos e explore a experiência preparada para terapeutas.",
  },
  {
    number: "3",
    title: "Compartilhe sua avaliação",
    description:
      "Conte o que funcionou, o que pode melhorar e o que gostaria de encontrar no AuraMeets.",
  },
  {
    number: "4",
    title: "Convide outros profissionais",
    description:
      "Ajude a formar o grupo dos 100 Terapeutas Cofundadores.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050916] text-white">
      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.14),transparent_36%)]" />

        <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:py-20">
          <div>
            <div className="inline-flex w-fit rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-yellow-400 sm:text-sm">
                Convite exclusivo
              </span>
            </div>

            <h1 className="mt-7 max-w-3xl text-4xl font-black leading-[1.08] sm:text-5xl lg:text-[54px] xl:text-6xl">
              Existe um novo capítulo para os terapeutas.
              <span className="mt-3 block text-yellow-400">
                E você foi convidado para escrevê-lo conosco.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              O AuraMeets está selecionando os primeiros profissionais que
              ajudarão a construir uma nova experiência de conexão entre
              terapeutas e pessoas que buscam acolhimento.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Os primeiros 30 terapeutas formarão o Conselho Inicial de
              Cofundadores. Depois, ampliaremos o grupo até completar os 100
              profissionais fundadores.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/cadastro-fundador"
                className="rounded-full bg-yellow-400 px-8 py-4 text-center text-lg font-bold text-slate-950 transition hover:scale-[1.02] hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
              >
                Quero ser Cofundador
              </Link>

              <a
                href="#projeto"
                className="rounded-full border border-slate-600 px-8 py-4 text-center text-lg font-bold transition hover:border-yellow-400 hover:bg-slate-900 hover:text-yellow-400"
              >
                Conhecer o projeto
              </a>
            </div>

            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                <strong className="block text-2xl text-yellow-400">30</strong>
                <span className="mt-1 block text-sm text-slate-300">
                  Conselho inicial
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                <strong className="block text-2xl text-yellow-400">100</strong>
                <span className="mt-1 block text-sm text-slate-300">
                  Cofundadores
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4">
                <strong className="block text-2xl text-yellow-400">
                  R$ 0,00
                </strong>
                <span className="mt-1 block text-sm text-slate-300">
                  Durante a validação
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex items-start justify-center">
            <div className="absolute -inset-5 rounded-[44px] bg-yellow-400/10 blur-3xl" />

            <div className="relative w-full overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900 shadow-2xl">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/hero-maos-mobile.jpg"
                />

                <Image
                  src="/hero-maos.jpg"
                  alt="Mãos conectadas por uma luz dourada, representando acolhimento e conexão"
                  width={1920}
                  height={1080}
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="h-[390px] w-full object-cover object-center sm:h-[470px] lg:h-[500px]"
                />
              </picture>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050916] via-[#050916]/90 to-transparent px-6 pb-7 pt-24 sm:px-8 sm:pb-9">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-yellow-400">
                  AuraMeets
                </p>

                <p className="mt-3 max-w-lg text-lg font-bold leading-7 text-white sm:text-2xl sm:leading-8">
                  Você não foi convidado apenas para testar uma plataforma.
                  Foi convidado para ajudar a construí-la.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJETO */}
      <section
        id="projeto"
        className="border-y border-slate-800 bg-slate-900/60"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-yellow-400">
              Por que apenas 100?
            </p>

            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
              Uma plataforma construída ao lado de quem vive a terapia todos
              os dias.
            </h2>

            <p className="mt-7 text-lg leading-8 text-slate-300 sm:text-xl">
              Acreditamos que uma plataforma criada com a participação de
              terapeutas reais será mais humana, útil e preparada para atender
              às necessidades da profissão.
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Por isso, antes da abertura ao público, queremos ouvir,
              compreender e aprender com os primeiros profissionais convidados.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-yellow-400">
            Terapeuta Cofundador
          </p>

          <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
            O que você recebe participando deste início
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Mais do que acesso antecipado, você terá a oportunidade de
            influenciar uma plataforma desenvolvida para valorizar o trabalho
            terapêutico.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {benefits.map((benefit) => (
            <article
              key={benefit.number}
              className="rounded-[28px] border border-slate-800 bg-slate-900/70 p-7 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/50"
            >
              <span className="text-sm font-black tracking-[0.2em] text-yellow-400">
                {benefit.number}
              </span>

              <h3 className="mt-5 text-2xl font-bold">{benefit.title}</h3>

              <p className="mt-4 leading-7 text-slate-400">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* MISSÃO */}
      <section className="bg-yellow-400 text-slate-950">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <p className="text-sm font-black uppercase tracking-[0.28em]">
            Nossa missão
          </p>

          <h2 className="mt-6 text-3xl font-black leading-tight sm:text-5xl">
            Tecnologia não deve substituir a conexão humana.
            <span className="block">Deve aproximá-la.</span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8">
            O AuraMeets nasceu para facilitar encontros baseados em confiança,
            acolhimento e propósito, valorizando profissionais e ajudando cada
            pessoa a encontrar um atendimento compatível com sua história.
          </p>
        </div>
      </section>

      {/* FUNDADOR */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div className="mx-auto w-full max-w-md">
            <div className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-100 shadow-2xl">
              <Image
                src="/fundador-oscar.png"
                alt="Oscar Ahumada, fundador do AuraMeets"
                width={768}
                height={1024}
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-yellow-400">
              Uma mensagem do fundador
            </p>

            <h2 className="mt-5 text-3xl font-black sm:text-5xl">
              Olá, eu sou Oscar Ahumada.
            </h2>

            <div className="mt-7 space-y-5 text-lg leading-8 text-slate-300">
              <p>
                Durante muitos anos acompanhei pessoas buscando respostas e
                profissionais comprometidos em transformar vidas.
              </p>

              <p>
                Percebi que os dois lados enfrentavam o mesmo desafio:
                encontrar a conexão certa.
              </p>

              <p>
                O AuraMeets nasceu para aproximar esses dois mundos com
                respeito, confiança e propósito.
              </p>

              <p>
                Não quero apenas lançar uma plataforma. Quero construir uma
                comunidade onde terapeutas sejam valorizados e pessoas
                encontrem acolhimento com mais segurança.
              </p>

              <p className="font-bold text-white">
                É por isso que convido você para participar deste início.
              </p>
            </div>

            <div className="mt-8">
              <p className="text-xl font-black text-yellow-400">
                Oscar Ahumada
              </p>
              <p className="mt-1 text-slate-400">Fundador do AuraMeets</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-y border-slate-800 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-yellow-400">
              Como funciona
            </p>

            <h2 className="mt-5 text-3xl font-black sm:text-5xl">
              Quatro passos para fazer parte desta história
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.number}
                className="flex gap-5 rounded-[26px] border border-slate-800 bg-[#050916] p-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-lg font-black text-slate-950">
                  {step.number}
                </span>

                <div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="rounded-[36px] border border-yellow-400/30 bg-gradient-to-br from-yellow-400/20 via-slate-900 to-slate-950 p-8 text-center sm:p-14">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-yellow-400">
            Conselho inicial
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
            Daqui a alguns anos, muitos profissionais poderão usar o
            AuraMeets.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Os primeiros poderão dizer: “Eu ajudei a construir esta história
            desde o início.”
          </p>

          <Link
            href="/cadastro-fundador"
            className="mt-9 inline-flex rounded-full bg-yellow-400 px-9 py-4 text-lg font-bold text-slate-950 transition hover:scale-[1.02] hover:bg-yellow-300"
          >
            Solicitar participação
          </Link>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Participação sem custo durante esta fase de validação. Nenhuma
            cobrança automática será realizada.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-5 py-8 text-center text-sm text-slate-500">
        <p>
          © 2026 AuraMeets. Plataforma em fase de pré-lançamento e validação.
        </p>
      </footer>
    </main>
  );
}
