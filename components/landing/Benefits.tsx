const benefits = [
  {
    title: "Mais visibilidade",
    text: "Seu perfil será apresentado para pessoas que já estão procurando atendimento terapêutico.",
  },
  {
    title: "Mais autoridade",
    text: "Tenha uma página profissional com especialidades, biografia, atendimento online e presencial.",
  },
  {
    title: "Mais oportunidades",
    text: "O AuraMeets ajuda você a ser encontrado por novos clientes de forma simples e organizada.",
  },
  {
    title: "Perfil verificado",
    text: "Transmita mais confiança para quem está escolhendo um profissional para cuidar de si.",
  },
  {
    title: "Divulgação nacional",
    text: "Participe das primeiras campanhas oficiais da plataforma e ganhe exposição desde o início.",
  },
  {
    title: "Crescimento profissional",
    text: "Transforme sua presença digital em um canal real de captação de novos atendimentos.",
  },
];

export default function Benefits() {
  return (
    <section className="bg-[#080D22] px-6 py-24 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <span className="text-sm font-bold uppercase tracking-[0.4em] text-yellow-400">
            Por que entrar?
          </span>

          <h2 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Você cuida das pessoas. Nós ajudamos seu trabalho a ser encontrado.
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            O AuraMeets foi criado para ampliar a presença digital de terapeutas
            e conectar profissionais qualificados a pessoas que buscam cuidado,
            orientação e transformação.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-[#111A33] p-8 transition hover:-translate-y-2 hover:border-yellow-400"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 font-black text-black">
                ✦
              </div>

              <h3 className="text-2xl font-bold">{item.title}</h3>

              <p className="mt-4 leading-7 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}