export function ClientHome() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <section className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">Encontre seu terapeuta ideal</h1>

        <p className="mt-2 text-slate-400">
          Busque por especialidade, cidade ou necessidade.
        </p>

        <div className="mt-8 rounded-3xl bg-slate-900 p-6">
          <input
            type="text"
            placeholder="O que você procura hoje? Ex: ansiedade, propósito, relacionamento..."
            className="w-full rounded-2xl bg-slate-800 p-4 text-white outline-none"
          />
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Categorias</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {["Numerologia", "Tarot", "Reiki", "Astrologia", "Constelação", "Meditação"].map(
              (item) => (
                <button
                  key={item}
                  className="rounded-full bg-slate-800 px-5 py-3 hover:bg-yellow-400 hover:text-slate-950"
                >
                  {item}
                </button>
              )
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-slate-900 p-6">
            <p className="text-yellow-400 font-semibold">Terapeuta em destaque</p>

            <h3 className="mt-3 text-3xl font-bold">Oscar Ahumada</h3>

            <p className="mt-2 text-slate-400">Numerólogo das Estrelas</p>

            <p className="mt-4 text-yellow-400">★★★★★ 4.9</p>

            <p className="mt-4 text-slate-300">
              Atendimento online e presencial em Belo Horizonte.
            </p>

            <button className="mt-6 rounded-full bg-yellow-400 px-6 py-3 font-bold text-slate-950">
              Ver perfil
            </button>
          </div>

          <div className="rounded-3xl bg-yellow-400 p-6 text-slate-950">
            <p className="font-semibold">Oferta Relâmpago</p>

            <h3 className="mt-3 text-3xl font-bold">
              Mapa Numerológico Completo
            </h3>

            <p className="mt-4 text-lg line-through">De R$ 395</p>

            <p className="text-4xl font-bold">Por R$ 197</p>

            <p className="mt-4 font-semibold">Hoje das 09h às 12h</p>

            <button className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-bold text-white">
              Reservar agora
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}