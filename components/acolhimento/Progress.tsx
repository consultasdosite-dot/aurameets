type ProgressProps = {
  current: number;
  total: number;
};

export default function Progress({
  current,
  total,
}: ProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="mb-8 w-full">
      <div className="mb-2 flex justify-between text-sm text-slate-400">
        <span>Progresso</span>

        <span>
          {current} de {total}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}