"use client";

type AppointmentActionsProps = {
  onAccept: () => void;
  onProposeNewTime: () => void;
  onDecline: () => void;
  loading?: boolean;
  visible?: boolean;
};

export default function AppointmentActions({
  onAccept,
  onProposeNewTime,
  onDecline,
  loading = false,
  visible = true,
}: AppointmentActionsProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onAccept}
        disabled={loading}
        className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processando..." : "Aceitar"}
      </button>

      <button
        type="button"
        onClick={onProposeNewTime}
        disabled={loading}
        className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processando..." : "Propor novo horário"}
      </button>

      <button
        type="button"
        onClick={onDecline}
        disabled={loading}
        className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Processando..." : "Recusar"}
      </button>
    </div>
  );
}