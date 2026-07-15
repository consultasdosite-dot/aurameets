import TherapistCard from "./TherapistCard";
import type { Therapist } from "./therapists";

import { getActiveTherapists } from "@/lib/therapists";

export default async function TherapistList() {
  const supabaseTherapists = await getActiveTherapists();

  const therapists: Therapist[] = supabaseTherapists.map((therapist) => {
    const especialidades = therapist.speciality
      ? therapist.speciality
          .split(/[,•]/)
          .map((item) => item.trim())
          .filter(Boolean)
      : ["Terapias Integrativas"];

    const cidade = [therapist.city, therapist.state]
      .filter(Boolean)
      .join(" - ");

    return {
      id: therapist.slug,
      nome: therapist.name,
      foto: therapist.photo_url ?? "",
      especialidades,
      cidade: cidade || "Atendimento online",
      compatibilidade: therapist.verified ? 95 : 85,
      experiencia:
        therapist.experience ?? "Experiência não informada",
      descricao:
        therapist.bio ??
        "Profissional cadastrado no AuraMeets.",
    };
  });

  const sortedTherapists = [...therapists].sort(
    (a, b) => b.compatibilidade - a.compatibilidade,
  );

  if (sortedTherapists.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-[#111A33] p-8 text-center">
        <h2 className="text-2xl font-black text-white">
          Nenhum terapeuta disponível no momento
        </h2>

        <p className="mt-4 leading-7 text-slate-300">
          Novos profissionais estão sendo preparados para entrar no AuraMeets.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {sortedTherapists.map((therapist) => (
        <TherapistCard
          key={therapist.id}
          therapist={therapist}
        />
      ))}
    </section>
  );
}