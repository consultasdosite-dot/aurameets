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
      "Seja encontrado por pessoas realmente interessadas nas terapias que você oferece.",
  },
];

export default function Benefits() {
  return (
    <section id="para-terapeutas">
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-yellow-400">
            Para terapeutas
          </p>

          <h2 className="mt-5 text-3xl font-black sm:text-5xl">
            Seu trabalho merece ser encontrado.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-300">
            Crie sua presença profissional e conecte-se com pessoas que procuram
            exatamente o atendimento que você oferece.
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
  );
}