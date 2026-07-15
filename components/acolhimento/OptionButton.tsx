type OptionButtonProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export default function OptionButton({
  label,
  selected,
  onClick,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-5 py-4 text-left text-base font-semibold transition ${
        selected
          ? "border-yellow-400 bg-yellow-400 text-slate-950"
          : "border-slate-700 bg-slate-900/70 text-slate-200 hover:border-yellow-400 hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}