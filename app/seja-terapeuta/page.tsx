export default function SejaTerapeutaPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-8 py-20 text-center">
        <h1 className="text-6xl font-bold">
          Faça parte da <span className="text-yellow-400">AuraMeets</span>
        </h1>

        <p className="mt-6 text-2xl text-slate-300">
          Conectando pessoas. Transformando vidas.
        </p>

        <p className="mx-auto mt-8 max-w-3xl text-lg text-slate-400">
          Cadastre seu perfil profissional, receba novos clientes, divulgue
          seus cursos, eventos e faça parte da maior comunidade de
          desenvolvimento humano da América Latina.
        </p>

        <button className="mt-10 rounded-xl bg-yellow-400 px-8 py-4 text-xl font-bold text-slate-900 hover:bg-yellow-300">
          Quero criar meu perfil
        </button>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto max-w-6xl px-8 py-16">
        <h2 className="mb-10 text-center text-4xl font-bold text-yellow-400">
          Por que entrar para a AuraMeets?
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-slate-900 p-6">
            <h3 className="text-xl font-bold">📅 Agenda Inteligente</h3>
            <p className="mt-3 text-slate-400">
              Organize todos os seus atendimentos em um único lugar.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6">
            <h3 className="text-xl font-bold">🌎 Mais Visibilidade</h3>
            <p className="mt-3 text-slate-400">
              Seja encontrado por milhares de pessoas.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6">
            <h3 className="text-xl font-bold">💳 Pagamentos</h3>
            <p className="mt-3 text-slate-400">
              Receba pelas consultas com segurança.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6">
            <h3 className="text-xl font-bold">⭐ Avaliações</h3>
            <p className="mt-3 text-slate-400">
              Construa sua reputação profissional.
            </p>
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="mx-auto max-w-6xl px-8 py-16">
        <h2 className="mb-10 text-center text-4xl font-bold text-yellow-400">
          Escolha seu plano
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-8">
            <h3 className="text-2xl font-bold">Gratuito</h3>
            <p className="mt-4 text-slate-400">
              Perfil básico para começar.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-yellow-400 bg-slate-900 p-8">
            <h3 className="text-2xl font-bold text-yellow-400">Premium</h3>

            <ul className="mt-5 space-y-3 text-slate-300">
              <li>✔ Perfil completo</li>
              <li>✔ Agenda</li>
              <li>✔ Cursos</li>
              <li>✔ Eventos</li>
              <li>✔ Destaque nas buscas</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-900 p-8">
            <h3 className="text-2xl font-bold">Destaque</h3>

            <ul className="mt-5 space-y-3 text-slate-300">
              <li>✔ Tudo do Premium</li>
              <li>✔ Selo Ouro</li>
              <li>✔ Mais Visibilidade</li>
              <li>✔ Perfil em Evidência</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FRASE */}
      <section className="mx-auto max-w-5xl px-8 py-20 text-center">
        <blockquote className="text-3xl italic text-slate-300">
          "A AuraMeets nasceu para aproximar pessoas de profissionais que
          realmente transformam vidas."
        </blockquote>

        <p className="mt-8 text-yellow-400 font-bold">
          Oscar Ahumada
        </p>
      </section>
    </main>
  );
}