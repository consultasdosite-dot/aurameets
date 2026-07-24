"use client";

import { FormEvent, useEffect, useState } from "react";

type ProposeDateModalProps = {
  open: boolean;
  clientName: string;
  initialDate?: string | null;
  initialTime?: string | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (data: {
    date: string;
    time: string;
    message: string;
  }) => void;
};

export default function ProposeDateModal({
  open,
  clientName,
  initialDate,
  initialTime,
  loading = false,
  onClose,
  onConfirm,
}: ProposeDateModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setDate(initialDate ?? "");
    setTime(initialTime?.slice(0, 5) ?? "");
    setMessage("");
  }, [open, initialDate, initialTime]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!date || !time) {
      return;
    }

    onConfirm({
      date,
      time,
      message: message.trim(),
    });
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="propose-date-modal-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-[#111A33] p-6 text-white shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
              Reagendamento
            </p>

            <h2
              id="propose-date-modal-title"
              className="mt-3 text-2xl font-black"
            >
              Propor novo horário
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              Cliente:{" "}
              <span className="font-semibold text-white">
                {clientName}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar modal"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#070B19] text-xl text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="proposed-date"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Nova data
            </label>

            <input
              id="proposed-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              disabled={loading}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-[#070B19] px-4 py-3 text-white outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="proposed-time"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Novo horário
            </label>

            <input
              id="proposed-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              disabled={loading}
              className="min-h-12 w-full rounded-xl border border-slate-700 bg-[#070B19] px-4 py-3 text-white outline-none transition focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="proposed-message"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Mensagem para o cliente
            </label>

            <textarea
              id="proposed-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={loading}
              rows={4}
              placeholder="Exemplo: Posso atender você neste novo horário."
              className="w-full resize-none rounded-xl border border-slate-700 bg-[#070B19] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-11 rounded-xl border border-slate-600 bg-transparent px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!date || !time || loading}
              className="min-h-11 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {loading
                ? "Salvando..."
                : "Enviar nova proposta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}