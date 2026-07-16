import Image from "next/image";
import Link from "next/link";

const specialties = [
  "Psicologia",
  "Numerologia",
  "Reiki",
  "Constelação Familiar",
  "Hipnoterapia",
  "Terapias Integrativas",
];

const steps = [
  {
    number: "1",
    title: "Conte sobre você",
    description:
      "Responda algumas perguntas rápidas sobre o seu momento e o que você está buscando.",
  },
  {
    number: "2",
    title: "Receba indicações",
    description:
      "O AuraMeets organiza as informações e apresenta profissionais compatíveis com você.",
  },
  {
    number: "3",
    title: "Escolha e agende",
    description:
      "Conheça os perfis, veja modalidades de atendimento e escolha o melhor horário.",
  },
  {
    number: "4",
    title: "Comece sua jornada",
    description:
      "Tenha uma experiência de acolhimento, clareza e transformação com mais segurança.",
  },
];

const trustItems = [
  {
    title: "Profissionais verificados",
    description:
      "Perfis organizados com informações claras para facilitar a sua escolha.",
  },
  {
    title: "Online e presencial",
    description:
      "Escolha a modalidade que melhor se adapta à sua rotina e ao seu momento.",
  },
  {
    title: "Privacidade e ética",
    description:
      "Seus dados e suas escolhas são tratados com respeito e responsabilidade.",
  },
  {
    title: "Avaliações reais",
    description:
      "Conheça experiências de outras pessoas antes de tomar sua decisão.",
  },
];

const featuredTherapists = [
  {
    name: "Oscar Ahumada",
    specialty: "Numerologia",
    location: "Atendimento online",
    slug: "oscar-ahumada",
    image: "/fundador-oscar.png",
  },
  {
    name: "Terapeuta em destaque",
    specialty: "Psicologia",
    location: "Online e presencial",
    slug: "",
    image: "/hero-maos.jpg",
  },
  {
    name: "Profissional AuraMeets",
    specialty: "Terapias Integrativas",
    location: "Atendimento online",
    slug: "",
    image: "/hero-maos-mobile.jpg",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#06101f] text-white">
      <header className="border-b border-white/10 bg-[#06101f]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-yellow-400/60 text-xl text-yellow-400">
              ✦
            </span>

            <div>
              <p className="text-2xl font-black tracking-tight text-yellow-400">
                AuraMeets
              </p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                Conecta • acolhe • transforma
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 lg:flex">
            <a href="#como-funciona" className="transition hover:text-yellow-400">
              Como funciona
            </a>
            <a href="#especialidades" className="transition hover:text-yellow-400">
              Especialidades
            </a>
            <Link href="/terapeutas" className="transition hover:text-yellow-400">
              Terapeutas
            </Link>
            <Link href="/seja-terapeuta" className="transition hover:text-yellow-400">
              Sou terapeuta
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl border border-slate-500 px-5 py-3 text-sm font-bold transition hover:border-yellow-400 hover:text-yellow-400 sm:inline-flex"
            >
              Entrar
            </Link>

            <Link
              href="/seja-visitante"
              className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Começar
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_32%,rgba(250,204,21,0.20),transparent_31%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
          <div className="relative z-10">
            <p className="text-sm font-black uppercase tracking-[0.26em] text-yellow-400">
              Bem-estar com mais clareza
            </p>

            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
              Conectamos você com o terapeuta ideal
              <span className="mt-2 block text-yellow-400">
                para o seu momento.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              No AuraMeets, você encontra profissionais, conhece suas
              especialidades e escolhe um atendimento alinhado ao que precisa
              viver agora.
            </p>

            <div className="mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
              <Link
                href="/seja-visitante"
                className="group rounded-3xl border border-yellow-400/40 bg-yellow-400/10 p-6 transition hover:-translate-y-1 hover:border-yellow-400 hover:bg-yellow-400/15"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-2xl text-slate-950">
                  ♡
                </span>
                <h2 className="mt-5 text-2xl font-black text-yellow-300">
                  Estou procurando um terapeuta
                </h2>
                <p className="mt-3 leading-7 text-slate-300">
                  Encontre o profissional ideal para o que você precisa agora.
                </p>
                <span className="mt-6 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-black text-slate-950 transition group-hover:bg-yellow-300">
                  Quero encontrar
                </span>
              </Link>

              <Link
                href="/seja-terapeuta"
                className="group rounded-3xl border border-blue-400/40 bg-blue-500/10 p-6 transition hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-500/15"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-2xl text-white">
                  ◯
                </span>
                <h2 className="mt-5 text-2xl font-black text-blue-300">
                  Sou terapeuta
                </h2>
                <p className="mt-3 leading-7 text-slate-300">
                  Faça parte da plataforma que valoriza seu propósito.
                </p>
                <span className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-black text-white transition group-hover:bg-blue-500">
                  Quero participar
                </span>
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Ambiente seguro, ético e pensado para conexões humanas.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-yellow-400/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-900 shadow-2xl">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet="/hero-maos-mobile.jpg"
                />

                <Image
                  src="/hero-maos.jpg"
                  alt="Conexão e acolhimento representados por mãos envolvidas por luz dourada"
                  width={1920}
                  height={1080}
                  priority
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="h-[460px] w-full object-cover sm:h-[560px] lg:h-[640px]"
                />
              </picture>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#06101f] via-[#06101f]/85 to-transparent px-7 pb-8 pt-28">
                <p className="max-w-xl text-2xl font-black leading-tight sm:text-3xl">
                  Quando você se escolhe, abre espaço para uma nova forma de
                  viver.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-y border-white/10 bg-[#081628]"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.26em] text-yellow-400">
              Como funciona
            </p>
            <h2 className="mt-5 text-3xl font-black sm:text-5xl">
              Um caminho simples até o profissional certo
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-3xl border border-white/10 bg-[#06101f] p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 font-black text-slate-950">
                  {step.number}
                </span>
                <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="especialidades"
        className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.85fr_1.15fr]"
      >
        <div>
          <p className="text-sm font-black uppercase tracking-[0.26em] text-yellow-400">
            Especialidades
          </p>
          <h2 className="mt-5 text-3xl font-black sm:text-5xl">
            Encontre apoio para diferentes momentos da sua vida
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Explore áreas terapêuticas e encontre um profissional com uma
            abordagem compatível com suas necessidades.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {specialties.map((specialty) => (
              <Link
                key={specialty}
                href={`/terapeutas?especialidade=${encodeURIComponent(
                  specialty,
                )}`}
                className="rounded-2xl border border-white/10 bg-[#081628] px-5 py-4 font-bold transition hover:border-yellow-400/60 hover:text-yellow-300"
              >
                {specialty}
              </Link>
            ))}
          </div>

          <Link
            href="/terapeutas"
            className="mt-7 inline-flex font-black text-yellow-400 transition hover:text-yellow-300"
          >
            Ver todas as especialidades →
          </Link>
        </div>

        <div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.26em] text-yellow-400">
                Profissionais
              </p>
              <h2 className="mt-5 text-3xl font-black sm:text-5xl">
                Terapeutas em destaque
              </h2>
            </div>

            <Link
              href="/terapeutas"
              className="hidden font-black text-yellow-400 transition hover:text-yellow-300 sm:inline-flex"
            >
              Ver todos →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredTherapists.map((therapist) => {
              const href = therapist.slug
                ? `/terapeuta/${therapist.slug}`
                : "/terapeutas";

              return (
                <article
                  key={therapist.name}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#081628]"
                >
                  <div className="relative h-56">
                    <Image
                      src={therapist.image}
                      alt={therapist.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#081628] via-transparent to-transparent" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-black">{therapist.name}</h3>
                    <p className="mt-2 font-bold text-yellow-400">
                      {therapist.specialty}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {therapist.location}
                    </p>
                    <Link
                      href={href}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-yellow-400/50 px-4 py-3 font-black text-yellow-300 transition hover:bg-yellow-400 hover:text-slate-950"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#081628]">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-16 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
          {trustItems.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/10 bg-[#06101f] p-6"
            >
              <span className="text-3xl text-yellow-400">✦</span>
              <h3 className="mt-4 text-xl font-black">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-400">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="rounded-[36px] border border-yellow-400/30 bg-[radial-gradient(circle_at_left,rgba(250,204,21,0.20),transparent_34%),linear-gradient(135deg,#0b1b31,#06101f)] p-8 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.26em] text-yellow-400">
                Seu próximo passo
              </p>
              <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
                Sua jornada de transformação pode começar agora.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Permita-se encontrar um profissional que compreenda o seu
                momento e caminhe ao seu lado.
              </p>
            </div>

            <Link
              href="/seja-visitante"
              className="inline-flex items-center justify-center rounded-2xl bg-yellow-400 px-8 py-5 text-center text-lg font-black text-slate-950 transition hover:bg-yellow-300"
            >
              Quero encontrar meu terapeuta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#040b15]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-2xl font-black text-yellow-400">AuraMeets</p>
            <p className="mt-4 max-w-md leading-7 text-slate-400">
              Uma plataforma criada para aproximar pessoas e terapeutas com
              confiança, acolhimento e propósito.
            </p>
          </div>

          <div>
            <p className="font-black">Para visitantes</p>
            <div className="mt-4 space-y-3 text-slate-400">
              <Link href="/seja-visitante" className="block hover:text-white">
                Encontrar terapeuta
              </Link>
              <Link href="/terapeutas" className="block hover:text-white">
                Ver profissionais
              </Link>
              <Link href="/login" className="block hover:text-white">
                Entrar
              </Link>
            </div>
          </div>

          <div>
            <p className="font-black">Para terapeutas</p>
            <div className="mt-4 space-y-3 text-slate-400">
              <Link href="/seja-terapeuta" className="block hover:text-white">
                Seja terapeuta
              </Link>
              <Link
                href="/cadastro-fundador"
                className="block hover:text-white"
              >
                Cadastro fundador
              </Link>
              <Link href="/login" className="block hover:text-white">
                Área do terapeuta
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-6 text-center text-sm text-slate-500">
          © 2026 AuraMeets. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  );
}
