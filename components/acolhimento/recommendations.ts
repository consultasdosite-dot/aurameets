export type Recommendation = {
  id: string;
  title: string;
  description: string;
};

export const recommendations: Recommendation[] = [
  {
    id: "psicologia",
    title: "Psicologia",
    description:
      "Pode ajudar na compreensão das emoções, pensamentos e comportamentos, oferecendo suporte para enfrentar desafios do momento.",
  },
  {
    id: "constelacao",
    title: "Constelação Familiar",
    description:
      "Indicada para quem deseja compreender padrões familiares, relacionamentos e situações que parecem se repetir.",
  },
  {
    id: "reiki",
    title: "Reiki",
    description:
      "Uma prática voltada ao relaxamento, equilíbrio energético e redução do estresse.",
  },
  {
    id: "hipnoterapia",
    title: "Hipnoterapia",
    description:
      "Pode auxiliar no trabalho de crenças, hábitos e questões emocionais profundas.",
  },
  {
    id: "terapia-integrativa",
    title: "Terapias Integrativas",
    description:
      "Conjunto de abordagens que promovem equilíbrio físico, emocional, mental e espiritual.",
  },
];