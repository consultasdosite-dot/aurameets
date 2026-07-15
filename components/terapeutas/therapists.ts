export type Therapist = {
  id: string;
  nome: string;
  foto: string;
  especialidades: string[];
  cidade: string;
  compatibilidade: number;
  experiencia: string;
  descricao: string;
};

export const therapists: Therapist[] = [
  {
    id: "oscar-ahumada",
    nome: "Oscar Ahumada",
    foto: "/images/therapists/oscar.jpg",
    especialidades: [
      "Numerologia",
      "Constelação Familiar",
    ],
    cidade: "Belo Horizonte - MG",
    compatibilidade: 96,
    experiencia: "Mais de 40 anos",
    descricao:
      "Especialista em autoconhecimento, propósito de vida e desenvolvimento humano.",
  },

  {
    id: "maria-silva",
    nome: "Maria Silva",
    foto: "/images/therapists/maria.jpg",
    especialidades: [
      "Psicologia",
      "Terapia Cognitiva",
    ],
    cidade: "São Paulo - SP",
    compatibilidade: 93,
    experiencia: "12 anos",
    descricao:
      "Atendimento voltado para ansiedade, autoestima e relações interpessoais.",
  },

  {
    id: "joao-costa",
    nome: "João Costa",
    foto: "/images/therapists/joao.jpg",
    especialidades: [
      "Reiki",
      "Terapias Integrativas",
    ],
    cidade: "Curitiba - PR",
    compatibilidade: 89,
    experiencia: "15 anos",
    descricao:
      "Trabalha com equilíbrio energético, relaxamento e bem-estar integral.",
  },
];