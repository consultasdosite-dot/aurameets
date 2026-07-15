import { journeyLabels } from "./journeyLabels";
import type { JourneyProfile } from "./journeyProfile";

export type JourneySummaryItem = {
  key: keyof JourneyProfile;
  label: string;
  score: number;
};

export function buildJourneySummary(
  profile: JourneyProfile,
): JourneySummaryItem[] {
  return Object.entries(profile)
    .map(([key, score]) => ({
      key: key as keyof JourneyProfile,
      label: journeyLabels[key as keyof JourneyProfile],
      score,
    }))
    .sort((a, b) => b.score - a.score);
}