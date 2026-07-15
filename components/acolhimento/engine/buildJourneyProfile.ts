import {
  JourneyProfile,
  emptyJourneyProfile,
} from "./journeyProfile";

type Answers = Record<string, string>;

export function buildJourneyProfile(
  answers: Answers,
): JourneyProfile {
  const profile: JourneyProfile = {
    ...emptyJourneyProfile,
  };

  const sentimento = answers.sentimento;
  const area = answers.area;
  const objetivo = answers.objetivo;

  if (
    sentimento === "Ansioso(a)" ||
    sentimento === "Sobrecarregado(a)"
  ) {
    profile.ansiedade += 30;
    profile.emocional += 20;
  }

  if (sentimento === "Triste") {
    profile.emocional += 35;
  }

  if (sentimento === "Sem energia") {
    profile.equilibrio += 30;
  }

  if (area === "Relacionamentos") {
    profile.relacionamentos += 40;
  }

  if (area === "Família") {
    profile.relacionamentos += 25;
  }

  if (
    area === "Propósito de vida" ||
    area === "Espiritualidade"
  ) {
    profile.espiritualidade += 40;
    profile.autoconhecimento += 20;
  }

  if (area === "Carreira") {
    profile.carreira += 35;
  }

  if (
    objetivo === "Desenvolver autoconhecimento"
  ) {
    profile.autoconhecimento += 40;
  }

  if (objetivo === "Encontrar equilíbrio") {
    profile.equilibrio += 40;
  }

  return profile;
}