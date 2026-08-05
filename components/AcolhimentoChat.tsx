"use client";

import { useState } from "react";

const whatsappNumber = "5551980339532";

const options = [
  {
    label: "Quero encontrar um terapeuta",
    message:
      "Olá! Estou acessando o AuraMeets e gostaria de ajuda para encontrar um terapeuta.",
  },
  {
    label: "Sou terapeuta e quero participar",
    message:
      "Olá! Sou terapeuta e gostaria de saber como participar do AuraMeets.",
  },
  {
    label: "Tenho dúvidas sobre um atendimento",
    message:
      "Olá! Estou no AuraMeets e preciso de ajuda com um atendimento ou agendamento.",
  },
  {
    label: "Tenho dúvidas sobre pagamentos",
    message:
      "Olá! Estou no AuraMeets e gostaria de esclarecer uma dúvida sobre pagamentos.",
  },
  {
    label: "Falar diretamente com o atendimento",
    message:
      "Olá! Estou acessando o AuraMeets e gostaria de falar com o atendimento.",
  },
];

export default function AcolhimentoChat() {
  const [isOpen, setIsOpen] = useState(false);

  function openWhatsApp(message: string) {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-4 w-[320px] max-w-[calc(100vw-40px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="bg-emerald-700 px-5 py-4 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.16em]">
              Atendimento AuraMeets
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Como podemos ajudar?
            </h2>

            <p className="mt-1 text-sm text-emerald-50">
              Escolha uma opção para falar diretamente pelo WhatsApp.
            </p>
          </div>

          <div className="space-y-2 p-4">
            {options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => openWhatsApp(option.message)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-emerald-500 hover:bg-emerald-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Fechar atendimento" : "Abrir atendimento"}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-2xl text-white shadow-xl transition hover:scale-105 hover:bg-emerald-800"
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}