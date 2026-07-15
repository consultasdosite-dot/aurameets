import type { Recommendation } from "../recommendations";
import { recommendations } from "../recommendations";
import { buildJourneyProfile } from "./buildJourneyProfile";

type Answers = Record<string, string>;

type RecommendationScore = {
  id: string;
  score: number;
};

function addScore(
  scores: RecommendationScore[],
  recommendationId: string,
  points: number,
) {
  const recommendation = scores.find(
    (item) => item.id === recommendationId,
  );

  if (recommendation) {
    recommendation.score += points;
  }
}

export function getRecommendations(
  answers: Answers,
): Recommendation[] {
  const profile = buildJourneyProfile(answers);

  const scores: RecommendationScore[] = recommendations.map(
    (recommendation) => ({
      id: recommendation.id,
      score: 0,
    }),
  );

  /*
   * PERFIL EMOCIONAL
   */

  if (profile.emocional >= 20) {
    addScore(scores, "psicologia", 4);
    addScore(scores, "terapia-integrativa", 2);
  }

  if (profile.emocional >= 35) {
    addScore(scores, "psicologia", 3);
  }

  /*
   * ANSIEDADE E SOBRECARGA
   */

  if (profile.ansiedade >= 20) {
    addScore(scores, "psicologia", 4);
    addScore(scores, "reiki", 2);
  }

  if (profile.ansiedade >= 30) {
    addScore(scores, "terapia-integrativa", 2);
  }

  /*
   * RELACIONAMENTOS E FAMÍLIA
   */

  if (profile.relacionamentos >= 20) {
    addScore(scores, "constelacao", 5);
    addScore(scores, "psicologia", 3);
  }

  if (profile.relacionamentos >= 40) {
    addScore(scores, "constelacao", 3);
  }

  /*
   * CARREIRA E FINANÇAS
   */

  if (profile.carreira >= 20) {
    addScore(scores, "psicologia", 3);
    addScore(scores, "hipnoterapia", 2);
  }

  /*
   * ESPIRITUALIDADE E PROPÓSITO
   */

  if (profile.espiritualidade >= 20) {
    addScore(scores, "terapia-integrativa", 4);
    addScore(scores, "reiki", 3);
  }

  if (profile.espiritualidade >= 40) {
    addScore(scores, "terapia-integrativa", 2);
  }

  /*
   * AUTOCONHECIMENTO
   */

  if (profile.autoconhecimento >= 20) {
    addScore(scores, "psicologia", 3);
    addScore(scores, "terapia-integrativa", 3);
    addScore(scores, "hipnoterapia", 2);
  }

  if (profile.autoconhecimento >= 40) {
    addScore(scores, "terapia-integrativa", 2);
  }

  /*
   * EQUILÍBRIO
   */

  if (profile.equilibrio >= 20) {
    addScore(scores, "reiki", 4);
    addScore(scores, "terapia-integrativa", 4);
  }

  if (profile.equilibrio >= 40) {
    addScore(scores, "reiki", 2);
  }

  /*
   * REGRAS COMPLEMENTARES
   *
   * Estas regras ainda utilizam algumas respostas diretas.
   * Elas refinam o resultado sem substituir o Journey Profile.
   */

  const tempo = answers.tempo;
  const impacto = answers.impacto;
  const experiencia = answers.experiencia;

  if (
    tempo === "Há mais de um ano" ||
    tempo === "É algo recorrente"
  ) {
    addScore(scores, "psicologia", 3);
    addScore(scores, "constelacao", 3);
    addScore(scores, "hipnoterapia", 2);
  }

  if (
    impacto === "Bastante" ||
    impacto === "Muito" ||
    impacto === "Está difícil continuar sozinho(a)"
  ) {
    addScore(scores, "psicologia", 5);
  }

  if (
    experiencia === "Já fiz terapia integrativa" ||
    experiencia === "Já experimentei diferentes abordagens"
  ) {
    addScore(scores, "terapia-integrativa", 2);
    addScore(scores, "reiki", 2);
  }

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((scoreItem) =>
      recommendations.find(
        (recommendation) => recommendation.id === scoreItem.id,
      ),
    )
    .filter(
      (recommendation): recommendation is Recommendation =>
        recommendation !== undefined,
    );
}