import type { Recommendation } from "./recommendations";

type RecommendationCardProps = {
  recommendation: Recommendation;
};

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  return (
    <article className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 transition hover:-translate-y-1 hover:border-yellow-400">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-xl font-black text-slate-950">
        ✓
      </div>

      <h2 className="mt-5 text-2xl font-black text-white">
        {recommendation.title}
      </h2>

      <p className="mt-3 leading-7 text-slate-300">
        {recommendation.description}
      </p>
    </article>
  );
}