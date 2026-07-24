type HeroClienteProps = {
  nome?: string;
};

export default function HeroCliente({ nome }: HeroClienteProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#047857] via-[#0F766E] to-[#115E59] text-white shadow-md">
      <div className="grid min-h-[300px] lg:grid-cols-[1.35fr_0.65fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="text-sm font-medium text-emerald-100">
            {nome ? `Bem-vindo, ${nome}` : "Bem-vindo ao AuraMeets"}
          </p>

          <h2 className="mt-2 max-w-3xl text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            Seu espaço de cuidado e transformação
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50 sm:text-base">
            Acompanhe seus atendimentos, visualize recomendações e encontre
            profissionais alinhados às suas necessidades.
          </p>
        </div>

        <div className="relative hidden min-h-[300px] lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E] via-[#115E59]/70 to-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-full border border-white/30 bg-white/10 shadow-lg backdrop-blur-sm">
              <div className="px-5 text-center">
                <p className="text-sm font-semibold text-white">
                  Imagem AuraMeets
                </p>

                <p className="mt-2 text-xs leading-5 text-emerald-100">
                  Foto das mãos será adicionada aqui
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}