import ClienteHeader from "@/components/cliente/ClienteHeader";
import ClienteSidebar from "@/components/cliente/ClienteSidebar";

export default function AtendimentosPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <ClienteHeader titulo="Meus Atendimentos" />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <ClienteSidebar />

        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Meus Atendimentos
            </h2>

            <p className="mt-3 text-slate-600">
              Aqui você acompanhará todos os seus atendimentos realizados,
              agendados e em andamento.
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-xl font-semibold text-slate-700">
              Nenhum atendimento encontrado
            </h3>

            <p className="mt-3 text-slate-500">
              Quando você solicitar seu primeiro atendimento, ele aparecerá
              nesta página.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}