import Link from "next/link";

const benefits = [
  {
    title: "Mais visibilidade",
    description:
      "Apresente seu trabalho para pessoas que estão procurando atendimento.",
  },
  {
    title: "Perfil profissional",
    description:
      "Divulgue especialidades, modalidades de atendimento e informações profissionais.",
  },
  {
    title: "Conexões qualificadas",
    description:
      "Seja encontrado por pessoas realmente interessadas em suas terapias.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-slate-800/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-yellow-400"
          >
            AuraMeets
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-3 font-bold text-slate-200 transition hover:text-yellow-400 sm:block"
            >
              Entrar
            </Link>

            <Link
              href="/cadastro-fundador"
              className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300 sm:px-6 sm:text-base"
            >
              Seja Fundador
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
              Conexões que transformam
            </p>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-6xl lg:text-7xl">
              Encontre o terapeuta certo para o seu momento.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              O AuraMeets conecta pessoas a terapeutas e profissionais do
              bem-estar de forma simples, segura e humana.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/cadastro-fundador"
                className="rounded-xl bg-yellow-400 px-7 py-4 text-center text-lg font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300"
              >
                Quero ser Terapeuta Fundador
              </Link>

              <Link
                href="/login"
                className="rounded-xl border border-slate-700 px-7 py-4 text-center text-lg font-bold transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Entrar na plataforma
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-400">
              Condição especial para os 100 primeiros terapeutas.
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-400/30 bg-[#111A33] p-6 shadow-2xl sm:p-8">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Plano Fundador
            </p>

            <h2 className="mt-5 text-3xl font-black">
              Faça parte do início do AuraMeets
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Garanta benefícios exclusivos e uma condição especial enquanto
              sua assinatura permanecer ativa.
            </p>

            <p className="mt-7 text-lg font-bold text-slate-400 line-through">
              Valor oficial: R$ 62/mês
            </p>

            <div className="mt-2 flex items-end gap-2">
              <span className="text-6xl font-black text-yellow-400">R$ 17</span>
              <span className="pb-2 text-lg font-bold">/mês</span>
            </div>

            <ul className="mt-8 space-y-4 text-slate-200">
              <li>✓ Selo exclusivo de Terapeuta Fundador</li>
              <li>✓ Prioridade nas primeiras buscas</li>
              <li>✓ Perfil profissional completo</li>
              <li>✓ Destaque nas campanhas oficiais</li>
            </ul>

            <Link
              href="/cadastro-fundador"
              className="mt-8 block rounded-xl bg-yellow-400 px-6 py-4 text-center font-black text-black transition hover:bg-yellow-300"
            >
              Garantir minha vaga
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-800 bg-[#080D22]">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
              Para terapeutas
            </p>

            <h2 className="mt-5 text-3xl font-black sm:text-5xl">
              Seu trabalho merece ser encontrado.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Crie sua presença profissional e conecte-se com pessoas que
              procuram exatamente o atendimento que você oferece.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <article
                key={benefit.title}
                className="rounded-3xl border border-slate-800 bg-[#111A33] p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-xl font-black text-black">
                  ✓
                </div>

                <h3 className="mt-6 text-2xl font-black">{benefit.title}</h3>

                <p className="mt-3 leading-7 text-slate-300">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-yellow-400 p-8 text-center text-black sm:p-12">
          <p className="text-sm font-black uppercase tracking-[0.25em]">
            Vagas limitadas
          </p>

          <h2 className="mt-5 text-3xl font-black sm:text-5xl">
            Seja um dos primeiros profissionais do AuraMeets.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg font-semibold leading-8">
            Cadastre-se como Terapeuta Fundador e participe da construção de uma
            nova comunidade de cuidado e transformação.
          </p>

          <Link
            href="/cadastro-fundador"
            className="mt-8 inline-block rounded-xl bg-black px-8 py-4 text-lg font-black text-yellow-400 transition hover:-translate-y-0.5"
          >
            Quero participar
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-center text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© 2026 AuraMeets. Todos os direitos reservados.</p>

          <div className="flex justify-center gap-5">
            <Link href="/login" className="hover:text-yellow-400">
              Login
            </Link>

            <Link href="/planos" className="hover:text-yellow-400">
              Planos
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}