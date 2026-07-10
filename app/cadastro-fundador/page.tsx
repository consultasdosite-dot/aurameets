"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const specialties = [
  "Psicologia",
  "Psicanálise",
  "Constelação Familiar",
  "Reiki",
  "Hipnoterapia",
  "Acupuntura",
  "Aromaterapia",
  "Florais",
  "Numerologia",
  "Astrologia",
  "Yoga",
  "Meditação",
  "Massoterapia",
  "Ayurveda",
  "Barras de Access",
  "Coaching",
  "Mentoria",
  "Terapias Integrativas",
  "Outra especialidade",
];

export default function CadastroFundadorPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [atendeOnline, setAtendeOnline] = useState(true);
  const [atendePresencial, setAtendePresencial] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [aceitouTermos, setAceitouTermos] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Informe seu nome completo.");
      return;
    }

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    if (!telefone.trim()) {
      setErro("Informe seu WhatsApp.");
      return;
    }

    if (!especialidade) {
      setErro("Selecione sua especialidade principal.");
      return;
    }

    if (!cidade.trim()) {
      setErro("Informe sua cidade.");
      return;
    }

    if (estado.trim().length !== 2) {
      setErro("Informe a sigla do estado com 2 letras.");
      return;
    }

    if (!atendeOnline && !atendePresencial) {
      setErro("Selecione pelo menos uma modalidade de atendimento.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    if (!aceitouTermos) {
      setErro("Você precisa aceitar os termos para continuar.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          name: nome.trim(),
          telefone: telefone.trim(),
          especialidade,
          cidade: cidade.trim(),
          estado: estado.trim().toUpperCase(),
          atende_online: atendeOnline,
          atende_presencial: atendePresencial,
          tipo_usuario: "terapeuta",
          plano: "fundador",
          valor_plano: 17,
          status_plano: "aguardando_pagamento",
        },
      },
    });

    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    setSucesso(true);
  }

  if (sucesso) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-4 py-10 text-white sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-3xl border border-yellow-400/40 bg-[#111A33] p-6 text-center shadow-2xl sm:p-8 md:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl font-black text-black sm:h-20 sm:w-20 sm:text-4xl">
            ✓
          </div>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-sm sm:tracking-[0.35em]">
            Cadastro recebido
          </p>

          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Bem-vindo ao AuraMeets.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Seu cadastro como Terapeuta Fundador foi realizado. Verifique seu
            e-mail para confirmar a conta e aguarde as próximas orientações para
            ativação do plano.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-[#080D22] p-5 text-left sm:p-6">
            <p className="font-bold text-yellow-400">Plano selecionado</p>
            <p className="mt-2 text-2xl font-black">Terapeuta Fundador</p>
            <p className="mt-2 text-slate-300">
              R$ 17 por mês enquanto sua assinatura permanecer ativa.
            </p>
          </div>

          <Link
            href="/login"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300 sm:w-auto"
          >
            Ir para o login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8 lg:py-12 xl:px-12">
      <div className="mx-auto grid w-full max-w-[1500px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 xl:grid-cols-[0.85fr_1.35fr] xl:gap-14">
        <section className="lg:sticky lg:top-8 lg:self-start xl:top-12">
          <Link
            href="/"
            className="inline-block text-2xl font-black text-yellow-400 transition hover:text-yellow-300"
          >
            AuraMeets
          </Link>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:mt-10 sm:text-sm sm:tracking-[0.35em] lg:mt-12">
            Cadastro exclusivo
          </p>

          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.05] sm:text-5xl lg:text-5xl xl:text-6xl">
            Seja um dos 100 Terapeutas Fundadores.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Entre na fase inicial do AuraMeets, ganhe mais visibilidade e ajude
            a construir uma nova forma de conectar pessoas e terapeutas.
          </p>

          <div className="mt-8 rounded-3xl border border-yellow-300/50 bg-yellow-400 p-6 text-black shadow-[0_20px_80px_rgba(250,204,21,0.12)] sm:p-8 lg:mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] sm:text-sm sm:tracking-[0.25em]">
                Condição de lançamento
              </p>

              <span className="rounded-full bg-black px-3 py-1 text-xs font-black uppercase tracking-wide text-yellow-400">
                Vagas limitadas
              </span>
            </div>

            <p className="mt-6 text-base font-bold line-through opacity-60 sm:text-lg">
              Valor oficial: R$ 62/mês
            </p>

            <div className="mt-2 flex flex-wrap items-end gap-2">
              <p className="text-5xl font-black sm:text-6xl">R$ 17</p>
              <p className="pb-2 text-lg font-black">/mês</p>
            </div>

            <p className="mt-3 font-bold">
              Enquanto sua assinatura permanecer ativa.
            </p>

            <div className="mt-5 inline-flex rounded-xl bg-black/10 px-4 py-3">
              <p className="text-sm font-black">
                Economia aproximada de 73% sobre o valor oficial
              </p>
            </div>

            <ul className="mt-8 space-y-4 text-sm font-semibold sm:text-base">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-sm text-yellow-400">
                  ✓
                </span>
                <span>Selo exclusivo de Terapeuta Fundador</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-sm text-yellow-400">
                  ✓
                </span>
                <span>Prioridade nas primeiras buscas da plataforma</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-sm text-yellow-400">
                  ✓
                </span>
                <span>Destaque nas campanhas oficiais do AuraMeets</span>
              </li>

              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-sm text-yellow-400">
                  ✓
                </span>
                <span>Perfil profissional completo para divulgar seu trabalho</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">100</p>
              <p className="mt-1 text-sm text-slate-300">
                vagas iniciais
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">R$ 17</p>
              <p className="mt-1 text-sm text-slate-300">
                valor mensal
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1125] p-4">
              <p className="text-2xl font-black text-yellow-400">73%</p>
              <p className="mt-1 text-sm text-slate-300">
                de economia
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-slate-800 bg-[#111A33] p-5 shadow-2xl sm:p-8 lg:p-9 xl:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400 sm:text-sm sm:tracking-[0.3em]">
            Seus dados
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Comece seu cadastro profissional
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Preencha as informações abaixo. Você poderá completar seu perfil
            profissional depois.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 sm:mt-10">
            <div>
              <label htmlFor="nome" className="mb-2 block font-bold">
                Nome completo
              </label>

              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite seu nome completo"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="email" className="mb-2 block font-bold">
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="telefone" className="mb-2 block font-bold">
                  WhatsApp
                </label>

                <input
                  id="telefone"
                  type="tel"
                  value={telefone}
                  onChange={(event) => setTelefone(event.target.value)}
                  placeholder="(31) 99999-9999"
                  autoComplete="tel"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="especialidade" className="mb-2 block font-bold">
                Especialidade principal
              </label>

              <select
                id="especialidade"
                value={especialidade}
                onChange={(event) => setEspecialidade(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
              >
                <option value="">Selecione uma especialidade</option>

                {specialties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_120px]">
              <div className="min-w-0">
                <label htmlFor="cidade" className="mb-2 block font-bold">
                  Cidade
                </label>

                <input
                  id="cidade"
                  type="text"
                  value={cidade}
                  onChange={(event) => setCidade(event.target.value)}
                  placeholder="Sua cidade"
                  autoComplete="address-level2"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
                />
              </div>

              <div>
                <label htmlFor="estado" className="mb-2 block font-bold">
                  Estado
                </label>

                <input
                  id="estado"
                  type="text"
                  value={estado}
                  onChange={(event) =>
                    setEstado(
                      event.target.value
                        .replace(/[^a-zA-Z]/g, "")
                        .slice(0, 2)
                        .toUpperCase(),
                    )
                  }
                  placeholder="MG"
                  autoComplete="address-level1"
                  maxLength={2}
                  required
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 uppercase outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
                />
              </div>
            </div>

            <fieldset>
              <legend className="mb-3 font-bold">
                Modalidade de atendimento
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    atendeOnline
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-slate-700 bg-[#080D22] hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={atendeOnline}
                    onChange={(event) => setAtendeOnline(event.target.checked)}
                    className="h-5 w-5 shrink-0 accent-yellow-400"
                  />

                  <span className="font-medium">Atendimento online</span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    atendePresencial
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-slate-700 bg-[#080D22] hover:border-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={atendePresencial}
                    onChange={(event) =>
                      setAtendePresencial(event.target.checked)
                    }
                    className="h-5 w-5 shrink-0 accent-yellow-400"
                  />

                  <span className="font-medium">Atendimento presencial</span>
                </label>
              </div>
            </fieldset>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="senha" className="mb-2 block font-bold">
                  Senha
                </label>

                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
                />
              </div>

              <div className="min-w-0">
                <label
                  htmlFor="confirmarSenha"
                  className="mb-2 block font-bold"
                >
                  Confirmar senha
                </label>

                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-4 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 sm:px-5"
                />
              </div>
            </div>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition sm:p-5 ${
                aceitouTermos
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-slate-700 bg-[#080D22] hover:border-slate-500"
              }`}
            >
              <input
                type="checkbox"
                checked={aceitouTermos}
                onChange={(event) => setAceitouTermos(event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-yellow-400"
              />

              <span className="text-sm leading-6 text-slate-300">
                Confirmo que as informações fornecidas são verdadeiras e aceito
                os termos de uso e a política de privacidade do AuraMeets.
              </span>
            </label>

            {erro && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300 sm:text-base"
              >
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-yellow-400 px-5 py-4 text-base font-black text-black shadow-[0_15px_45px_rgba(250,204,21,0.15)] transition hover:-translate-y-0.5 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:px-6 sm:py-5 sm:text-lg"
            >
              {carregando
                ? "Realizando cadastro..."
                : "Garantir minha vaga de Fundador"}
            </button>

            <p className="text-center text-sm leading-6 text-slate-400">
              Já possui cadastro?{" "}
              <Link
                href="/login"
                className="font-bold text-yellow-400 transition hover:text-yellow-300 hover:underline"
              >
                Entrar na minha conta
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}