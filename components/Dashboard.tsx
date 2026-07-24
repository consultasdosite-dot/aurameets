import DashboardHeader from "./DashboardHeader";
import { TherapistProfile } from "./TherapistProfile";

type Therapist = {
  name?: string;
  views?: number;
  messages?: number;
  appointments?: number;
};

type DashboardProps = {
  therapist: Therapist | null;
};

export default function Dashboard({ therapist }: DashboardProps) {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <DashboardHeader therapistName={therapist?.name} />

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">Visualizações</p>

          <h2 className="mt-2 text-3xl font-bold">
            {therapist?.views ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">Mensagens</p>

          <h2 className="mt-2 text-3xl font-bold">
            {therapist?.messages ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">Atendimentos</p>

          <h2 className="mt-2 text-3xl font-bold">
            {therapist?.appointments ?? 0}
          </h2>
        </div>

        <div className="rounded-2xl bg-yellow-400 p-6 text-slate-950">
          <p>Oferta Relâmpago</p>

          <h2 className="mt-2 text-2xl font-bold">ATIVA</h2>
        </div>
      </section>

      <TherapistProfile therapist={therapist} />

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          "Meu Perfil",
          "Agenda",
          "Oferta do Dia",
          "Mensagens",
          "Financeiro",
          "Configurações",
        ].map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-xl bg-slate-800 p-6 text-left transition-colors hover:bg-slate-700"
          >
            {item}
          </button>
        ))}
      </section>
    </main>
  );
}