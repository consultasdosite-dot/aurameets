const steps = [
  {
    number: "01",
    title: "Crie seu perfil",
    text: "Cadastre suas informações profissionais, especialidades, formas de atendimento e dados de contato.",
  },
  {
    number: "02",
    title: "Receba sua verificação",
    text: "Seu perfil será analisado para transmitir mais segurança e confiança aos visitantes da plataforma.",
  },
  {
    number: "03",
    title: "Seja encontrado",
    text: "Pessoas que procuram atendimento poderão localizar você por especialidade, cidade ou modalidade.",
  },
  {
    number: "04",
    title: "Conquiste novos atendimentos",
    text: "Transforme sua presença digital em oportunidades reais de conexão com novos clientes.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#050816] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-sm font-bold uppercase tracking-[0.4em] text-yellow-400">
            Como funciona
          </span>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Do cadastro ao primeiro contato, tudo pensado para facilitar sua presença online.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-slate-800 bg-[#111A33] p-8"
            >
              <span className="text-5xl font-black text-yellow-400">
                {step.number}
              </span>

              <h3 className="mt-8 text-2xl font-bold">
                {step.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-300">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}