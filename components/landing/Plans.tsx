const plans = [
  {
    name: "Terapeuta Fundador",
    range: "Do 1º ao 100º terapeuta",
    price: "R$ 17,00/mês",
    description:
      "Condição exclusiva para os 100 primeiros profissionais cadastrados no AuraMeets.",
    features: [
      "Perfil profissional completo",
      "Especialidades e modalidades de atendimento",
      "Serviços avulsos e pacotes",
      "Galeria de fotos e vídeo de apresentação",
      "Selo Terapeuta Fundador",
      "Prioridade nas primeiras buscas",
      "Destaque nas campanhas oficiais",
      "Valor preservado enquanto permanecer ativo",
    ],
    highlight: true,
    badge: "Primeiros 100",
  },
  {
    name: "Plano Expansão",
    range: "Do 101º ao 200º terapeuta",
    price: "R$ 35,00/mês",
    description:
      "Condição destinada à segunda fase de crescimento da comunidade AuraMeets.",
    features: [
      "Perfil profissional completo",
      "Especialidades e modalidades de atendimento",
      "Serviços avulsos e pacotes",
      "Galeria de fotos e vídeo de apresentação",
      "Maior visibilidade nas buscas",
      "Estatísticas do perfil",
      "Participação nas campanhas da plataforma",
      "Valor preservado enquanto permanecer ativo",
    ],
    highlight: false,
    badge: "Vagas 101 a 200",
  },
  {
    name: "Plano Profissional",
    range: "Do 201º ao 1.000º terapeuta",
    price: "R$ 44,00/mês",
    description:
      "Plano oficial para os profissionais que ingressarem na fase de consolidação da plataforma.",
    features: [
      "Perfil profissional completo",
      "Especialidades e modalidades de atendimento",
      "Serviços avulsos e pacotes",
      "Galeria de fotos e vídeo de apresentação",
      "Visibilidade nas buscas",
      "Estatísticas do perfil",
      "Participação nas campanhas da plataforma",
      "Valor preservado enquanto permanecer ativo",
    ],
    highlight: false,
    badge: "Vagas 201 a 1.000",
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
            Entre agora e garanta uma condição especial no AuraMeets.
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            O valor da mensalidade é definido pela posição de entrada do
            terapeuta na plataforma e permanece preservado enquanto a assinatura
            estiver ativa.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-3xl border p-8 transition hover:-translate-y-2 ${
                plan.highlight
                  ? "border-yellow-400 bg-yellow-400 text-black shadow-2xl"
                  : "border-slate-800 bg-[#111A33] text-white"
              }`}
            >
              <div
                className={`absolute -top-5 left-8 rounded-full px-5 py-2 text-sm font-bold ${
                  plan.highlight
                    ? "bg-black text-yellow-400"
                    : "border border-slate-700 bg-[#111A33] text-yellow-400"
                }`}
              >
                {plan.badge}
              </div>

              <h3 className="mt-3 text-3xl font-black">{plan.name}</h3>

              <p
                className={`mt-4 text-sm font-black uppercase tracking-[0.12em] ${
                  plan.highlight ? "text-black/70" : "text-yellow-400"
                }`}
              >
                {plan.range}
              </p>

              <p
                className={`mt-5 leading-7 ${
                  plan.highlight ? "text-black/75" : "text-slate-300"
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 text-4xl font-black">{plan.price}</div>

              <p
                className={`mt-3 text-sm font-bold leading-6 ${
                  plan.highlight ? "text-black/75" : "text-slate-400"
                }`}
              >
                Valor mensal mantido enquanto a assinatura permanecer ativa.
              </p>

              <ul className="mt-8 flex-1 space-y-4">
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
                Quero entrar no AuraMeets
              </a>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-6 text-slate-400">
          As faixas são preenchidas conforme a ordem de entrada dos terapeutas:
          do 1º ao 100º por R$ 17,00/mês, do 101º ao 200º por R$ 35,00/mês e do
          201º ao 1.000º por R$ 44,00/mês.
        </p>
      </div>
    </section>
  );
}