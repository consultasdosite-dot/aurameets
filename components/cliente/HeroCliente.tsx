type HeroClienteProps = {
  nome?: string;
};

export default function HeroCliente({ nome }: HeroClienteProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#047857] via-[#0F766E] to-[#115E59] text-white shadow-md">
      <div className="grid min-h-[300px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10">
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

        <div className="relative min-h-[220px] sm:min-h-[260px] lg:min-h-[300px]">
          <img
            src="/hero-aura-maos.png"
            alt="AuraMeets — cuidado, conexão e acolhimento"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E] via-[#0F766E]/35 to-transparent lg:from-[#0F766E]/80 lg:via-[#0F766E]/20" />
        </div>
      </div>
    </section>
  );
}