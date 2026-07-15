export type QuestionType = "single" | "text";

export type Question = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
};

export const questions: Question[] = [
  {
    id: "sentimento",
    title: "Como você está se sentindo hoje?",
    description:
      "Escolha a opção que mais se aproxima do seu estado neste momento.",
    type: "single",
    options: [
      "Ansioso(a)",
      "Triste",
      "Sobrecarregado(a)",
      "Confuso(a)",
      "Sem energia",
      "Em busca de equilíbrio",
      "Outro",
    ],
  },
  {
    id: "area",
    title: "Qual área da sua vida mais precisa de atenção agora?",
    type: "single",
    options: [
      "Relacionamentos",
      "Família",
      "Trabalho ou carreira",
      "Finanças",
      "Saúde emocional",
      "Propósito de vida",
      "Espiritualidade",
      "Outro",
    ],
  },
  {
    id: "tempo",
    title: "Há quanto tempo você está vivendo essa situação?",
    type: "single",
    options: [
      "Há poucos dias",
      "Há algumas semanas",
      "Há alguns meses",
      "Há mais de um ano",
      "É algo recorrente",
      "Não consigo identificar",
    ],
  },
  {
    id: "impacto",
    title: "Quanto essa situação tem afetado sua rotina?",
    type: "single",
    options: [
      "Pouco",
      "Moderadamente",
      "Bastante",
      "Muito",
      "Está difícil continuar sozinho(a)",
    ],
  },
  {
    id: "experiencia",
    title: "Você já realizou algum tipo de terapia ou acompanhamento?",
    type: "single",
    options: [
      "Nunca fiz",
      "Já fiz terapia psicológica",
      "Já fiz terapia integrativa",
      "Já experimentei diferentes abordagens",
      "Estou em acompanhamento atualmente",
    ],
  },
  {
    id: "preferencia",
    title: "Como você gostaria de ser atendido?",
    type: "single",
    options: [
      "Online",
      "Presencial",
      "Tanto faz",
      "Ainda não sei",
    ],
  },
  {
    id: "objetivo",
    title: "O que você espera encontrar neste momento?",
    type: "single",
    options: [
      "Alívio emocional",
      "Clareza para tomar decisões",
      "Melhorar meus relacionamentos",
      "Compreender padrões repetitivos",
      "Encontrar equilíbrio",
      "Desenvolver autoconhecimento",
      "Outro",
    ],
  },
  {
    id: "historia",
    title: "Deseja contar um pouco mais sobre o que está vivendo?",
    description:
      "Este espaço é opcional. Escreva apenas o que se sentir confortável para compartilhar.",
    type: "text",
    placeholder: "Conte um pouco da sua história...",
  },
];