const plans = [
  {
    name: "Essencial",
    price: "Grátis",
    description: "Para começar sua presença no AuraMeets.",
    features: [
      "Perfil básico publicado",
      "Até 3 especialidades",
      "Atendimento online ou presencial",
      "Contato disponível no perfil",
    ],
    highlight: false,
  },
  {
    name: "Profissional",
    price: "R$ 59/mês",
    description: "Para terapeutas que querem crescer com mais visibilidade.",
    features: [
      "Tudo do Essencial",
      "Mais destaque nas buscas",
      "Galeria de fotos",
      "Vídeo de apresentação",
      "Estatísticas do perfil",
    ],
    highlight: false,
  },
  {
    name: "Fundador",
    price: "R$ 17/mês",
    oldPrice: "De R$ 59/mês",
    description: "Oferta exclusiva para os 100 primeiros terapeutas.",
    features: [
      "Tudo do Profissional",
      "Selo Terapeuta Fundador",
      "Prioridade nas primeiras buscas",
      "Destaque nas campanhas oficiais",
      "Valor especial enquanto permanecer ativo",
    ],
    highlight: true,
  },
];

export default function Plans() {
  return (
    <section className="bg-[#080D22] px-6 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.4em] text-yellow-400">
            Planos
          </span>

          <h2 className="mt-6 text-3xl font-black leading-tight md:text-5xl">
            Escolha como deseja crescer dentro do AuraMeets.
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            Comece gratuitamente ou garanta uma das 100 vagas de Terapeuta
            Fundador com valor especial de lançamento.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-8 transition hover:-translate-y-2 ${
                plan.highlight
                  ? "border-yellow-400 bg-yellow-400 text-black shadow-2xl"
                  : "border-slate-800 bg-[#111A33] text-white"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-5 left-8 rounded-full bg-black px-5 py-2 text-sm font-bold text-yellow-400">
                  Terapeuta Fundador
                </div>
              )}

              <h3 className="text-3xl font-black">{plan.name}</h3>

              <p
                className={`mt-4 ${
                  plan.highlight ? "text-black/70" : "text-slate-400"
                }`}
              >
                {plan.description}
              </p>

              {plan.oldPrice && (
                <p className="mt-8 text-lg font-bold line-through opacity-70">
                  {plan.oldPrice}
                </p>
              )}

              <div className="mt-3 text-4xl font-black">{plan.price}</div>

              {plan.highlight && (
                <p className="mt-2 font-bold">Valor especial enquanto permanecer ativo.</p>
              )}

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="font-black">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/cadastro"
                className={`mt-10 block rounded-xl px-6 py-4 text-center font-bold transition ${
                  plan.highlight
                    ? "bg-black text-yellow-400 hover:bg-slate-900"
                    : "bg-yellow-400 text-black hover:bg-yellow-300"
                }`}
              >
                {plan.highlight ? "Quero ser Fundador" : "Quero este plano"}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}