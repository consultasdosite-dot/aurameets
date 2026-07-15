import type { JourneyProfile } from "./journeyProfile";

export type JourneyDimension = keyof JourneyProfile;

export const journeyLabels: Record<JourneyDimension, string> = {
  emocional: "Saúde emocional",
  ansiedade: "Ansiedade e sobrecarga",
  relacionamentos: "Relacionamentos e família",
  carreira: "Carreira e vida profissional",
  espiritualidade: "Espiritualidade e propósito",
  autoconhecimento: "Autoconhecimento",
  equilibrio: "Equilíbrio e bem-estar",
};