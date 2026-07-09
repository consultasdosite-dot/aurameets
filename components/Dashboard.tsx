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
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <section>
        <h1 className="text-4xl font-bold">
          Olá, {therapist?.name ?? "Oscar"} 👋
        </h1>

        <p className="mt-2 text-slate-400">Bem-vindo ao AuraMeets</p>
      </section>

      <section className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-900 p-6">
          <p className="text-slate-400">Visualizações</p>
          <h2 className="mt-2 text-3xl font-bold">{therapist?.views ?? 0}</h2>
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
            className="rounded-xl bg-slate-800 p-6 hover:bg-slate-700"
          >
            {item}
          </button>
        ))}
      </section>
    </main>
  );
}