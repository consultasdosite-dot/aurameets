import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TherapistPage({ params }: Props) {
  const { id } = await params;

  const { data: therapist } = await supabase
    .from("therapists")
    .select("*")
    .eq("id", id)
    .single();

  if (!therapist) notFound();

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <section className="mx-auto max-w-5xl rounded-3xl bg-slate-900 p-10">
        <p className="font-semibold text-yellow-400">Perfil AuraMeets</p>

        {therapist.photo_url && (
          <img
            src={therapist.photo_url}
            alt={therapist.name}
            className="mb-6 mt-6 h-40 w-40 rounded-full object-cover"
          />
        )}

        <h1 className="mt-3 text-4xl font-bold">{therapist.name}</h1>

        <p className="mt-2 text-xl text-slate-300">{therapist.speciality}</p>

        <p className="mt-6 text-slate-400">
          {therapist.bio || "Biografia ainda não cadastrada."}
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href={`https://wa.me/55${therapist.phone}`}
            target="_blank"
            className="rounded-xl bg-green-500 px-6 py-4 text-center font-bold text-white hover:bg-green-600"
          >
            Conversar no WhatsApp
          </a>

          <button className="rounded-xl bg-yellow-400 px-6 py-4 font-bold text-slate-950 hover:bg-yellow-300">
            Agendar Consulta
          </button>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-800 p-6">
          <h2 className="text-2xl font-bold text-yellow-400">
            Consulta Particular
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-slate-400">Valor</p>
              <p className="text-2xl font-bold">R$ {therapist.price}</p>
            </div>

            <div>
              <p className="text-slate-400">Duração</p>
              <p className="text-2xl font-bold">{therapist.duration}</p>
            </div>

            <div>
              <p className="text-slate-400">Experiência</p>
              <p className="text-2xl font-bold">{therapist.experience}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-800 p-6">
          <h2 className="text-2xl font-bold text-yellow-400">
            Depoimentos no Google
          </h2>

          <p className="mt-2 text-slate-300">
            Avaliação média: ⭐ {therapist.rating} no Google Meu Negócio
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-900 p-5">
              <p className="text-yellow-400">★★★★★</p>
              <p className="mt-3 text-slate-300">
                “Atendimento profundo, claro e transformador.”
              </p>
              <p className="mt-4 text-sm text-slate-500">Cliente Google</p>
            </div>

            <div className="rounded-xl bg-slate-900 p-5">
              <p className="text-yellow-400">★★★★★</p>
              <p className="mt-3 text-slate-300">
                “A Numerologia trouxe direção e autoconhecimento.”
              </p>
              <p className="mt-4 text-sm text-slate-500">Cliente Google</p>
            </div>

            <div className="rounded-xl bg-slate-900 p-5">
              <p className="text-yellow-400">★★★★★</p>
              <p className="mt-3 text-slate-300">
                “Experiência excelente. Recomendo o trabalho.”
              </p>
              <p className="mt-4 text-sm text-slate-500">Cliente Google</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">Cidade</p>
            <p className="font-bold">{therapist.city}</p>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">Atendimento</p>
            <p className="font-bold">{therapist.service_type}</p>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">Plano</p>
            <p className="font-bold text-yellow-400">{therapist.plan}</p>
          </div>

          <div className="rounded-xl bg-slate-800 p-5">
            <p className="text-slate-400">Avaliação</p>
            <p className="font-bold">⭐ {therapist.rating}</p>
          </div>
        </div>
      </section>
    </main>
  );
}