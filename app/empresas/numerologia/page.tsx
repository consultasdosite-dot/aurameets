"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type CompanyStatus =
  | "em_atividade"
  | "registrada_sem_inicio"
  | "ainda_vai_lancar";

type FormState = {
  nomeFantasia: string;
  razaoSocial: string;
  situacao: CompanyStatus;
  dataEmpresa: string;
  endereco: string;
  titularNome: string;
  titularNascimento: string;
  whatsapp: string;
  email: string;
};

const STORAGE_KEY = "aurameets_numerologia_empresarial_draft";

const initialForm: FormState = {
  nomeFantasia: "",
  razaoSocial: "",
  situacao: "em_atividade",
  dataEmpresa: "",
  endereco: "",
  titularNome: "",
  titularNascimento: "",
  whatsapp: "",
  email: "",
};

function normalizePhone(value: string) {
  return value.replace(/[^\d()+\-\s]/g, "").slice(0, 24);
}

export default function NumerologiaEmpresarialPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [savedMessage, setSavedMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as Partial<FormState>;

      setForm({
        ...initialForm,
        ...parsed,
      });
    } catch {
      // Se o rascunho local estiver inválido, apenas ignora.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {
      // O formulário continua funcionando mesmo sem armazenamento local.
    }
  }, [form]);

  const dateLabel = useMemo(() => {
    if (form.situacao === "em_atividade") {
      return "Data de início da empresa";
    }

    if (form.situacao === "registrada_sem_inicio") {
      return "Data de registro";
    }

    return "Data prevista de lançamento";
  }, [form.situacao]);

  const dateHelp = useMemo(() => {
    if (form.situacao === "ainda_vai_lancar") {
      return "Se a data ainda não estiver definida, você pode deixar este campo em branco.";
    }

    return "Informe a data oficial que representa o início ou registro da empresa.";
  }, [form.situacao]);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSavedMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.nomeFantasia.trim()) {
      setErrorMessage("Informe o Nome Fantasia.");
      return;
    }

    if (!form.razaoSocial.trim()) {
      setErrorMessage("Informe a Razão Social.");
      return;
    }

    if (
      form.situacao !== "ainda_vai_lancar" &&
      !form.dataEmpresa
    ) {
      setErrorMessage(`Informe ${dateLabel.toLowerCase()}.`);
      return;
    }

    if (!form.endereco.trim()) {
      setErrorMessage("Informe o endereço da empresa.");
      return;
    }

    if (!form.titularNome.trim()) {
      setErrorMessage(
        "Informe o nome completo do titular da empresa.",
      );
      return;
    }

    if (!form.titularNascimento) {
      setErrorMessage(
        "Informe a data de nascimento do titular.",
      );
      return;
    }

    if (!form.whatsapp.trim()) {
      setErrorMessage("Informe um WhatsApp para contato.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Informe um e-mail para contato.");
      return;
    }

    setSending(true);
    setErrorMessage("");
    setSavedMessage("");

    const { error } = await supabase
      .from("consultas_numerologia_empresarial")
      .insert({
        nome_fantasia: form.nomeFantasia.trim(),
        razao_social: form.razaoSocial.trim(),
        situacao_empresa: form.situacao,
        data_empresa: form.dataEmpresa || null,
        endereco: form.endereco.trim(),
        titular_nome: form.titularNome.trim(),
        titular_data_nascimento:
          form.titularNascimento,
        whatsapp: form.whatsapp.trim(),
        email: form.email.trim().toLowerCase(),
        status: "nova",
      });

    setSending(false);

    if (error) {
      console.error(
        "Erro ao enviar Consulta Numerológica Empresarial:",
        error,
      );

      setErrorMessage(
        "Não foi possível enviar sua solicitação agora. Confira os dados e tente novamente.",
      );
      return;
    }

    setSavedMessage(
      "Solicitação enviada com sucesso. Recebemos os dados da sua empresa e entraremos em contato.",
    );

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada a fazer.
    }

    setForm(initialForm);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  function clearDraft() {
    setForm(initialForm);
    setSavedMessage("");
    setErrorMessage("");

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada a fazer.
    }
  }

  const inputClassName =
    "w-full rounded-2xl border border-white/10 bg-[#0B1224] px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 autofill:shadow-[inset_0_0_0_1000px_#0B1224] autofill:[-webkit-text-fill-color:white]";

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="border-b border-white/10 bg-[#050816]/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/empresas"
            className="text-2xl font-black tracking-tight text-yellow-400"
          >
            AuraMeets
          </Link>

          <Link
            href="/empresas"
            className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
          >
            Voltar
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_38%),linear-gradient(180deg,#090d20_0%,#050816_100%)]" />

        <div className="relative mx-auto max-w-5xl px-5 py-12 text-center sm:px-8 sm:py-16">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-300">
            AuraMeets Empresas
          </p>

          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
            Consulta Numerológica Empresarial
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Preencha os dados principais da empresa e do titular para preparar
            uma leitura numerológica empresarial personalizada.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8"
          >
            <div className="border-b border-white/10 pb-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                Dados da empresa
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Informações para a leitura
              </h2>

              <p className="mt-2 leading-7 text-slate-400">
                Preencha com os nomes e dados oficiais usados pela empresa.
              </p>
            </div>

            <div className="mt-7 grid gap-6">
              <label>
                <span className="mb-2 block font-bold text-slate-200">
                  Nome Fantasia
                </span>

                <input
                  type="text"
                  value={form.nomeFantasia}
                  onChange={(event) =>
                    updateField("nomeFantasia", event.target.value)
                  }
                  placeholder="Ex.: AuraMeets"
                  className={inputClassName}
                />
              </label>

              <label>
                <span className="mb-2 block font-bold text-slate-200">
                  Razão Social
                </span>

                <input
                  type="text"
                  value={form.razaoSocial}
                  onChange={(event) =>
                    updateField("razaoSocial", event.target.value)
                  }
                  placeholder="Digite a razão social completa"
                  className={inputClassName}
                />
              </label>

              <fieldset>
                <legend className="mb-3 block font-bold text-slate-200">
                  Situação da empresa
                </legend>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      value: "em_atividade" as CompanyStatus,
                      title: "Já está em atividade",
                      text: "A empresa já começou a funcionar.",
                    },
                    {
                      value: "registrada_sem_inicio" as CompanyStatus,
                      title: "Já foi registrada",
                      text: "Existe registro, mas ainda não iniciou.",
                    },
                    {
                      value: "ainda_vai_lancar" as CompanyStatus,
                      title: "Ainda vai ser lançada",
                      text: "A empresa está em fase de preparação.",
                    },
                  ].map((option) => {
                    const selected = form.situacao === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          updateField("situacao", option.value)
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-yellow-400 bg-yellow-400 text-slate-950"
                            : "border-white/10 bg-[#0B1224] text-white hover:border-purple-400/50"
                        }`}
                      >
                        <p className="font-black">
                          {option.title}
                        </p>

                        <p
                          className={`mt-2 text-xs leading-5 ${
                            selected
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {option.text}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label>
                <span className="mb-2 block font-bold text-slate-200">
                  {dateLabel}
                </span>

                <input
                  type="date"
                  value={form.dataEmpresa}
                  onChange={(event) =>
                    updateField("dataEmpresa", event.target.value)
                  }
                  className={`${inputClassName} [color-scheme:dark]`}
                />

                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  {dateHelp}
                </span>
              </label>

              <label>
                <span className="mb-2 block font-bold text-slate-200">
                  Endereço completo da empresa
                </span>

                <textarea
                  value={form.endereco}
                  onChange={(event) =>
                    updateField("endereco", event.target.value)
                  }
                  rows={3}
                  placeholder="Rua, número, complemento, bairro, cidade, estado e CEP"
                  className={`${inputClassName} resize-y`}
                />
              </label>
            </div>

            <div className="mt-10 border-t border-white/10 pt-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
                Titular da empresa
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Dados do responsável principal
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block font-bold text-slate-200">
                    Nome completo
                  </span>

                  <input
                    type="text"
                    value={form.titularNome}
                    onChange={(event) =>
                      updateField("titularNome", event.target.value)
                    }
                    placeholder="Nome completo do titular"
                    className={inputClassName}
                  />
                </label>

                <label>
                  <span className="mb-2 block font-bold text-slate-200">
                    Data de nascimento
                  </span>

                  <input
                    type="date"
                    value={form.titularNascimento}
                    onChange={(event) =>
                      updateField(
                        "titularNascimento",
                        event.target.value,
                      )
                    }
                    className={`${inputClassName} [color-scheme:dark]`}
                  />
                </label>
              </div>
            </div>

            <div className="mt-10 border-t border-white/10 pt-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                Contato
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Para receber o retorno da consulta
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block font-bold text-slate-200">
                    WhatsApp
                  </span>

                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(event) =>
                      updateField(
                        "whatsapp",
                        normalizePhone(event.target.value),
                      )
                    }
                    placeholder="(00) 00000-0000"
                    className={inputClassName}
                  />
                </label>

                <label>
                  <span className="mb-2 block font-bold text-slate-200">
                    E-mail
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    placeholder="empresa@email.com"
                    className={inputClassName}
                  />
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-7 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-200">
                {errorMessage}
              </div>
            )}

            {savedMessage && (
              <div className="mt-7 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 leading-7 text-emerald-200">
                {savedMessage}
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                type="submit"
                disabled={sending}
                className="min-h-16 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-7 py-4 text-lg font-black text-white shadow-[0_12px_30px_rgba(147,51,234,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending
                  ? "ENVIANDO..."
                  : "SOLICITAR MINHA CONSULTA NUMEROLÓGICA EMPRESARIAL"}
              </button>

              <button
                type="button"
                onClick={clearDraft}
                className="min-h-16 rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-400 transition hover:border-white/20 hover:text-white"
              >
                LIMPAR
              </button>
            </div>
          </form>

          <aside className="space-y-5">
            <article className="rounded-[28px] border border-yellow-400/20 bg-yellow-400/[0.06] p-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">
                O que será observado
              </p>

              <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                <p>
                  <strong className="text-white">
                    Nome Fantasia
                  </strong>
                  <br />
                  A força de apresentação e posicionamento da empresa.
                </p>

                <p>
                  <strong className="text-white">
                    Razão Social
                  </strong>
                  <br />
                  A estrutura formal e a vibração do nome registrado.
                </p>

                <p>
                  <strong className="text-white">
                    Data da empresa
                  </strong>
                  <br />
                  O ciclo e o destino empresarial.
                </p>

                <p>
                  <strong className="text-white">
                    Endereço
                  </strong>
                  <br />
                  A influência do número do local sobre a atividade.
                </p>

                <p>
                  <strong className="text-white">
                    Titular
                  </strong>
                  <br />
                  A relação entre a energia pessoal do responsável e a empresa.
                </p>
              </div>
            </article>

            <article className="rounded-[28px] border border-purple-400/20 bg-purple-500/[0.07] p-6">
              <p className="font-black text-purple-200">
                Seus dados ficam salvos como rascunho neste navegador enquanto
                você preenche o formulário.
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Ao enviar, sua solicitação é registrada no AuraMeets para
                acompanhamento da equipe.
              </p>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}