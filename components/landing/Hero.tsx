export default function Hero() {
  return (
    <section className="bg-[#070B1C] text-white py-28">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">

        <div>

          <span className="uppercase tracking-[8px] text-yellow-400 text-sm">
            PARA TERAPEUTAS
          </span>

          <h1 className="text-6xl lg:text-7xl font-black leading-tight mt-6">

            Faça com que
            <br />

            seu trabalho

            <span className="text-yellow-400">
              {" "}seja encontrado.
            </span>

          </h1>

          <p className="text-xl text-gray-300 mt-8 leading-9">

            O AuraMeets conecta terapeutas qualificados às pessoas que realmente procuram seu atendimento.

            Mais visibilidade.

            Mais autoridade.

            Mais pacientes.

          </p>

          <div className="mt-10 flex gap-5">

            <button className="bg-yellow-400 text-black font-bold px-10 py-5 rounded-xl hover:scale-105 transition">

              Quero ser Terapeuta Fundador

            </button>

            <button className="border border-gray-600 px-10 py-5 rounded-xl">

              Conhecer a Plataforma

            </button>

          </div>

          <div className="flex gap-10 mt-12 text-gray-400">

            <div>

              <p className="text-3xl font-bold text-white">40+</p>

              Especialidades

            </div>

            <div>

              <p className="text-3xl font-bold text-white">100</p>

              Fundadores

            </div>

            <div>

              <p className="text-3xl font-bold text-white">Brasil</p>

              Todo o país

            </div>

          </div>

        </div>

        <div>

          <div className="rounded-3xl bg-[#111A33] p-10 border border-[#25314F] shadow-2xl">

            <span className="uppercase tracking-[5px] text-yellow-400">

              Terapeuta Fundador

            </span>

            <h2 className="text-4xl font-bold mt-6">

              Seja um dos primeiros profissionais da plataforma.

            </h2>

            <p className="mt-6 text-gray-300 leading-8">

              Os primeiros terapeutas terão prioridade nas buscas,
              destaque nas campanhas nacionais,
              selo exclusivo de Fundador
              e participação no lançamento oficial do AuraMeets.

            </p>

            <div className="space-y-4 mt-10">

              <div className="bg-[#1A2442] rounded-xl p-5">
                ✔ Perfil Premium
              </div>

              <div className="bg-[#1A2442] rounded-xl p-5">
                ✔ Destaque nas pesquisas
              </div>

              <div className="bg-[#1A2442] rounded-xl p-5">
                ✔ Campanhas nacionais
              </div>

              <div className="bg-[#1A2442] rounded-xl p-5">
                ✔ Selo Fundador Vitalício
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}