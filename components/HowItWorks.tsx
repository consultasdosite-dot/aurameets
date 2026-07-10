const steps = [
  {
    number: "01",
    title: "Crie seu perfil",
    description:
      "Cadastre suas especialidades, modalidades de atendimento e informações profissionais.",
  },
  {
    number: "02",
    title: "Seja encontrado",
    description:
      "Apareça para pessoas que estão procurando exatamente o atendimento que você oferece.",
  },
  {
    number: "03",
    title: "Conecte-se",
    description:
      "Receba novos contatos e transforme sua experiência em novas oportunidades.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-y border-slate-800 bg-[#080D22]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            Como funciona
          </p>

          <h2 className="mt-5 text-3xl font-black sm:text-5xl">
            Três passos para ampliar sua presença profissional.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-3xl border border-slate-800 bg-[#111A33] p-7"
            >
              <p className="text-4xl font-black text-yellow-400">
                {step.number}
              </p>

              <h3 className="mt-6 text-2xl font-black">
                {step.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}