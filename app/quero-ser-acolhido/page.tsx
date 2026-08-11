"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function QueroSerAcolhidoPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [email, setEmail] = useState("");
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState("");

  function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!nome.trim() || !whatsapp.trim() || !cidade.trim() || !email.trim()) {
      setErro("Preencha todos os campos para continuar.");
      return;
    }

    if (!consentimento) {
      setErro("Você precisa concordar com o uso dos dados para continuar.");
      return;
    }

    const dadosVisitante = {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      cidade: cidade.trim(),
      email: email.trim(),
    };

    localStorage.setItem(
      "aurameets_visitante",
      JSON.stringify(dadosVisitante)
    );

    router.push("/fala-sistemica");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8f2fc] via-white to-[#fffdfb] px-5 py-10 text-[#101d3b] sm:px-8">
      <div className="mx-auto max-w-[620px]">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8d4dc2] to-[#62259d] text-3xl text-white shadow-lg">
            ♡
          </div>

          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#7541ad]">
            Sua experiência começa aqui
          </p>

          <h1 className="mt-3 text-[34px] font-black leading-tight tracking-[-0.04em] text-[#101d3b] sm:text-[42px]">
            Quero ser acolhida/o
          </h1>

          <p className="mx-auto mt-4 max-w-[520px] text-[16px] font-medium leading-7 text-[#536078]">
            Antes de começarmos, queremos conhecer um pouco sobre você para
            tornar sua experiência no AuraMeets mais pessoal e acolhedora.
          </p>
        </div>

        <form
          onSubmit={enviarFormulario}
          className="mt-10 rounded-[26px] border border-[#e7dcef] bg-white p-6 shadow-[0_16px_45px_rgba(74,44,110,0.10)] sm:p-8"
        >
          <div>
            <label
              htmlFor="nome"
              className="text-sm font-extrabold text-[#2e3850]"
            >
              Como você gostaria de ser chamada/o?
            </label>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Seu nome"
              className="mt-2 min-h-[52px] w-full rounded-xl border border-[#dcd3e3] bg-[#fcfafc] px-4 text-[15px] outline-none transition focus:border-[#7541ad] focus:ring-2 focus:ring-[#7541ad]/15"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="whatsapp"
              className="text-sm font-extrabold text-[#2e3850]"
            >
              Qual é o seu WhatsApp?
            </label>

            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              placeholder="(00) 00000-0000"
              className="mt-2 min-h-[52px] w-full rounded-xl border border-[#dcd3e3] bg-[#fcfafc] px-4 text-[15px] outline-none transition focus:border-[#7541ad] focus:ring-2 focus:ring-[#7541ad]/15"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="cidade"
              className="text-sm font-extrabold text-[#2e3850]"
            >
              Em que cidade você está?
            </label>

            <input
              id="cidade"
              type="text"
              value={cidade}
              onChange={(event) => setCidade(event.target.value)}
              placeholder="Cidade / Estado"
              className="mt-2 min-h-[52px] w-full rounded-xl border border-[#dcd3e3] bg-[#fcfafc] px-4 text-[15px] outline-none transition focus:border-[#7541ad] focus:ring-2 focus:ring-[#7541ad]/15"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="email"
              className="text-sm font-extrabold text-[#2e3850]"
            >
              Qual é o seu melhor e-mail?
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              className="mt-2 min-h-[52px] w-full rounded-xl border border-[#dcd3e3] bg-[#fcfafc] px-4 text-[15px] outline-none transition focus:border-[#7541ad] focus:ring-2 focus:ring-[#7541ad]/15"
            />
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-[#f8f4fb] p-4">
            <input
              type="checkbox"
              checked={consentimento}
              onChange={(event) => setConsentimento(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[#7541ad]"
            />

            <span className="text-[13px] font-medium leading-5 text-[#5c667b]">
              Concordo com o uso dos meus dados para realizar esta experiência
              e receber comunicações relacionadas ao AuraMeets.
            </span>
          </label>

          {erro && (
            <div className="mt-5 rounded-xl border border-[#f1caca] bg-[#fff5f5] px-4 py-3 text-sm font-bold text-[#9b3434]">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="mt-7 flex min-h-[56px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#7e46b9] to-[#542c91] px-6 text-[15px] font-black uppercase tracking-[0.04em] text-white shadow-[0_14px_30px_rgba(87,45,145,0.24)] transition hover:-translate-y-0.5"
          >
            Quero ser acolhida/o
          </button>

          <p className="mt-4 text-center text-xs font-medium text-[#7b8498]">
            É gratuito e leva poucos minutos.
          </p>
        </form>
      </div>
    </main>
  );
}