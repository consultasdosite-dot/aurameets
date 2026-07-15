export type JourneyProfile = {
  emocional: number;
  ansiedade: number;
  relacionamentos: number;
  carreira: number;
  espiritualidade: number;
  autoconhecimento: number;
  equilibrio: number;
};

export const emptyJourneyProfile: JourneyProfile = {
  emocional: 0,
  ansiedade: 0,
  relacionamentos: 0,
  carreira: 0,
  espiritualidade: 0,
  autoconhecimento: 0,
  equilibrio: 0,
};