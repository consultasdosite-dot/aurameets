import ClienteHeader from "@/components/cliente/ClienteHeader";
import ClienteSidebar from "@/components/cliente/ClienteSidebar";

const terapeutas = [
  {
    id: 1,
    nome: "Terapeuta AuraMeets",
    especialidade: "Desenvolvimento pessoal e equilíbrio emocional",
    descricao:
      "Profissional preparado para acolher suas necessidades e acompanhar sua jornada de desenvolvimento.",
  },
  {
    id: 2,
    nome: "Terapeuta AuraMeets",
    especialidade: "Autoconhecimento e relacionamentos",
    descricao:
      "Atendimento voltado para compreensão de padrões, fortalecimento emocional e melhoria dos relacionamentos.",
  },
  {
    id: 3,
    nome: "Terapeuta AuraMeets",
    especialidade: "Bem-estar e qualidade de vida",
    descricao:
      "Acompanhamento personalizado para construir uma rotina mais equilibrada, consciente e saudável.",
  },
];

export default function TerapeutasPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ClienteHeader titulo="Terapeutas" />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <ClienteSidebar />

        <section className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold text-emerald-600">
              Profissionais AuraMeets
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Encontre o terapeuta ideal para você
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-slate-600">
              Conheça os profissionais disponíveis na plataforma. Em breve,
              você receberá recomendações personalizadas com base nas respostas
              da sua avaliação inicial.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {terapeutas.map((terapeuta) => (
              <article
                key={terapeuta.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-xl font-bold text-emerald-700">
                  AM
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  {terapeuta.nome}
                </h3>

                <p className="mt-2 text-sm font-semibold leading-6 text-emerald-700">
                  {terapeuta.especialidade}
                </p>

                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {terapeuta.descricao}
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-6 cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
                >
                  Ver perfil
                </button>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-6 text-center">
            <h3 className="text-lg font-bold text-slate-900">
              Sua recomendação será personalizada
            </h3>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Após concluir sua avaliação, a AuraMeets poderá indicar os
              profissionais mais alinhados ao seu momento e às suas
              necessidades.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}