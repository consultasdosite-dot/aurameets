export default function Hero() {
  return (
    <section className="min-h-screen bg-slate-950 px-6 pt-36 pb-20 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-yellow-400">
            Plataforma de bem-estar
          </p>

          <h1 className="max-w-3xl text-5xl font-bold leading-tight md:text-7xl">
            Encontre o terapeuta certo para o seu momento
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            O AuraMeets conecta você a terapeutas, especialistas e profissionais
            de bem-estar com segurança, clareza e acolhimento.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/terapeuta"
              className="rounded-xl bg-yellow-400 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-yellow-300"
            >
              Encontrar terapeuta
            </a>

            <a
              href="/seja-terapeuta"
              className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-white transition hover:border-yellow-400"
            >
              Cadastrar meu perfil
            </a>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-slate-800 pt-8">
            <div>
              <strong className="text-2xl text-yellow-400">+500</strong>
              <p className="mt-1 text-sm text-slate-400">terapeutas</p>
            </div>

            <div>
              <strong className="text-2xl text-yellow-400">4.9</strong>
              <p className="mt-1 text-sm text-slate-400">avaliação média</p>
            </div>

            <div>
              <strong className="text-2xl text-yellow-400">24h</strong>
              <p className="mt-1 text-sm text-slate-400">para agendar</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-yellow-400/10 blur-3xl" />

          <div className="relative rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-800 to-slate-950 p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-yellow-400">
                AuraMatch
              </p>

              <h2 className="mt-5 text-3xl font-bold">
                Conexão inteligente entre pessoas e terapeutas
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Em breve, nossa busca ajudará cada pessoa a encontrar o
                profissional mais alinhado ao seu objetivo, especialidade e
                disponibilidade.
              </p>

              <div className="mt-8 space-y-4">
                {["Terapias integrativas", "Atendimento online", "Perfil verificado"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-4"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}