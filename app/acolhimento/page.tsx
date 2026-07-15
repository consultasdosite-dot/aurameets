import Link from "next/link";

export default function AcolhimentoPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B16] text-white">
      {/* Iluminação decorativa */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-16 sm:px-8">
        <section className="w-full rounded-3xl border border-white/10 bg-[#111A33]/85 p-6 shadow-2xl backdrop-blur-md sm:p-10 lg:p-14">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            Acolhimento Sistêmico
          </p>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Antes de indicar um terapeuta, queremos acolher você.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
            Este é um espaço seguro para você compartilhar um pouco do que está
            vivendo. Suas respostas ajudarão o AuraMeets a identificar caminhos
            terapêuticos mais adequados para o seu momento.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-2xl font-black text-yellow-400">01</span>

              <h2 className="mt-3 font-black">Conte seu momento</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Responda perguntas simples sobre o que você está vivendo.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-2xl font-black text-yellow-400">02</span>

              <h2 className="mt-3 font-black">Receba orientação</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Identificaremos abordagens que podem fazer sentido para você.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <span className="text-2xl font-black text-yellow-400">03</span>

              <h2 className="mt-3 font-black">Encontre profissionais</h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Conheça terapeutas compatíveis com sua necessidade.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/acolhimento/perguntas"
              className="rounded-xl bg-yellow-400 px-8 py-4 text-center text-lg font-black text-black transition hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
            >
              Iniciar meu acolhimento
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-white/20 px-8 py-4 text-center text-lg font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Voltar
            </Link>
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-400">
            Este acolhimento não substitui diagnóstico, atendimento médico,
            psicológico ou emergencial.
          </p>
        </section>
      </div>
    </main>
  );
}