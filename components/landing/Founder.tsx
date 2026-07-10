export default function Founder() {
  return (
    <section className="bg-[#060B1F] py-28 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-[6px] text-yellow-400">
            Nossa missão
          </span>

          <h2 className="mt-6 max-w-xl text-3xl font-black leading-[1.1] md:text-4xl lg:text-5xl">
            O AuraMeets nasceu para aproximar pessoas de profissionais que
            realmente podem transformar vidas.
          </h2>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-300">
            Durante muitos anos percebemos que excelentes terapeutas permaneciam
            praticamente invisíveis na internet, enquanto milhares de pessoas
            buscavam ajuda sem saber onde encontrar profissionais realmente
            qualificados.
          </p>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-300">
            O AuraMeets foi criado para mudar essa realidade. Nossa missão é
            conectar pessoas e terapeutas através de uma plataforma moderna,
            segura, transparente e construída para gerar confiança.
          </p>

          <div className="mt-10 max-w-xl border-l-4 border-yellow-400 pl-6">
            <p className="text-2xl font-bold">
              "Conectar quem procura ajuda com quem nasceu para cuidar."
            </p>
          </div>
        </div>

        <div>
          <div className="rounded-3xl border border-[#24304A] bg-[#111A33] p-10 shadow-2xl">
            <span className="uppercase tracking-[5px] text-yellow-400">
              Fundador
            </span>

            <h3 className="mt-5 text-4xl font-bold">Oscar Ahumada</h3>

            <p className="mt-6 leading-8 text-gray-300">
              Numerólogo com décadas de experiência no desenvolvimento humano e
              criador do AuraMeets.
            </p>

            <div className="mt-10 space-y-5">
              <div className="rounded-xl bg-[#1A2442] p-5">
                ✓ Décadas ajudando pessoas através do autoconhecimento.
              </div>

              <div className="rounded-xl bg-[#1A2442] p-5">
                ✓ Visão nacional sobre o mercado terapêutico.
              </div>

              <div className="rounded-xl bg-[#1A2442] p-5">
                ✓ Plataforma criada para gerar confiança e conexões reais.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}