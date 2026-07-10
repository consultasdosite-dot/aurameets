const benefits = [
  {
    title: "Perfil Premium",
    text: "Seu perfil terá destaque desde o lançamento da plataforma.",
  },
  {
    title: "Selo Fundador",
    text: "Mostre que você acreditou no AuraMeets desde o primeiro dia.",
  },
  {
    title: "Mais Visibilidade",
    text: "Prioridade nas pesquisas e nas primeiras recomendações.",
  },
  {
    title: "Campanhas Oficiais",
    text: "Seu perfil poderá aparecer nas divulgações nacionais da plataforma.",
  },
  {
    title: "Autoridade",
    text: "Passe mais confiança para novos pacientes e clientes.",
  },
  {
    title: "Valor Congelado",
    text: "Enquanto permanecer ativo, sua mensalidade nunca aumentará.",
  },
];

export default function FounderBenefits() {
  return (
    <section className="bg-[#050816] py-32 text-white">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <span className="uppercase tracking-[6px] text-yellow-400 font-semibold text-sm">
            BENEFÍCIOS DO FUNDADOR
          </span>

          <h2 className="mt-6 text-4xl md:text-6xl font-black leading-tight">
            Entre hoje.
            <br />
            Colha resultados por muitos anos.
          </h2>

          <p className="mt-8 text-xl text-slate-300 leading-8">
            Os primeiros terapeutas terão vantagens exclusivas e participarão
            da construção da maior plataforma brasileira dedicada ao
            desenvolvimento humano.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {benefits.map((item) => (

            <div
              key={item.title}
              className="rounded-3xl border border-slate-800 bg-[#111A33] p-8 transition duration-300 hover:-translate-y-2 hover:border-yellow-400"
            >

              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-2xl text-black">
                ★
              </div>

              <h3 className="text-2xl font-bold">
                {item.title}
              </h3>

              <p className="mt-4 leading-8 text-slate-300">
                {item.text}
              </p>

            </div>

          ))}

        </div>

        <div className="mt-24 rounded-[40px] bg-gradient-to-r from-yellow-400 to-yellow-300 p-[2px]">

          <div className="rounded-[38px] bg-[#080D22] p-12 lg:flex lg:items-center lg:justify-between">

            <div>

              <span className="uppercase tracking-[5px] text-yellow-400 text-sm">
                Oferta de lançamento
              </span>

              <h3 className="mt-5 text-4xl font-black">
                Apenas 100 terapeutas terão este benefício.
              </h3>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                Depois que as vagas forem preenchidas, o plano Fundador será
                encerrado e novos profissionais entrarão com os valores oficiais
                da plataforma.
              </p>

            </div>

            <div className="mt-10 lg:mt-0">

              <div className="text-center">

                <p className="text-slate-400 line-through text-2xl">
                  R$ 62/mês
                </p>

                <h2 className="mt-2 text-6xl font-black text-yellow-400">
                  R$ 17
                </h2>

                <p className="text-xl text-slate-300">
                  por mês
                </p>

                <p className="mt-3 font-semibold text-yellow-400">
                  enquanto permanecer ativo
                </p>

                <a
                  href="/cadastro"
                  className="mt-10 inline-block rounded-2xl bg-yellow-400 px-10 py-5 text-xl font-bold text-black transition hover:scale-105"
                >
                  Quero ser um Terapeuta Fundador
                </a>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}