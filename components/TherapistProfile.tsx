type Therapist = {
  name?: string;
  speciality?: string;
  city?: string;
  bio?: string;
  service_type?: string;
  plan?: string;
  rating?: number;
  verified?: boolean;
};

type TherapistProfileProps = {
  therapist: Therapist | null;
};

export function TherapistProfile({ therapist }: TherapistProfileProps) {
  return (
    <section className="mt-10 rounded-3xl bg-slate-900 p-8 text-white">
      <p className="text-yellow-400 font-semibold">
        {therapist?.verified ? "Perfil Verificado" : "Perfil em análise"}
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        {therapist?.name ?? "Terapeuta"}
      </h2>

      <p className="mt-2 text-slate-300">
        {therapist?.speciality ?? "Especialidade não informada"}
      </p>

      <p className="mt-4 max-w-2xl text-slate-400">
        {therapist?.bio ?? "Biografia ainda não cadastrada."}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-800 p-5">
          <p className="text-slate-400">Especialidade</p>
          <p className="mt-2 font-bold">{therapist?.speciality ?? "-"}</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-5">
          <p className="text-slate-400">Atendimento</p>
          <p className="mt-2 font-bold">{therapist?.service_type ?? "-"}</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-5">
          <p className="text-slate-400">Cidade</p>
          <p className="mt-2 font-bold">{therapist?.city ?? "-"}</p>
        </div>

        <div className="rounded-2xl bg-slate-800 p-5">
          <p className="text-slate-400">Plano</p>
          <p className="mt-2 font-bold text-yellow-400">
            {therapist?.plan ?? "Free"}
          </p>
        </div>
      </div>
    </section>
  );
}