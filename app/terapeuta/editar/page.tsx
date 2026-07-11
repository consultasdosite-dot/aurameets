"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

type TherapistForm = {
  id: number | null;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  city: string;
  state: string;
  bio: string;
  photo_url: string;
  service_type: string;
  instagram: string;
  website: string;
  duration: string;
  experience: string;
  price: string;
};

const formularioInicial: TherapistForm = {
  id: null,
  name: "",
  email: "",
  phone: "",
  speciality: "",
  city: "",
  state: "",
  bio: "",
  photo_url: "",
  service_type: "",
  instagram: "",
  website: "",
  duration: "",
  experience: "",
  price: "",
};

const inputClassName =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

function formatarValorParaCampo(valor: number | null) {
  if (valor === null || valor === undefined) return "";

  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function converterValorParaNumero(valor: string) {
  const valorLimpo = valor
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(valorLimpo);

  return Number.isFinite(numero) ? numero : null;
}

export default function EditarTerapeutaPage() {
  const router = useRouter();

  const [form, setForm] = useState<TherapistForm>(formularioInicial);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarPerfil() {
      setCarregando(true);
      setErro("");

      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (!componenteAtivo) return;

      if (erroUsuario || !user?.email) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .select(
          `
            id,
            name,
            email,
            phone,
            speciality,
            city,
            state,
            bio,
            photo_url,
            service_type,
            instagram,
            website,
            duration,
            experience,
            price
          `,
        )
        .eq("email", user.email)
        .maybeSingle();

      if (!componenteAtivo) return;

      if (error) {
        console.error("Erro ao carregar perfil:", error);
        setErro("Não foi possível carregar seu perfil profissional.");
        setCarregando(false);
        return;
      }

      if (!data) {
        setErro(
          "Não encontramos um perfil profissional associado ao seu e-mail.",
        );
        setCarregando(false);
        return;
      }

      setForm({
        id: data.id,
        name: data.name ?? "",
        email: data.email ?? user.email,
        phone: data.phone ?? "",
        speciality: data.speciality ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        bio: data.bio ?? "",
        photo_url: data.photo_url ?? "",
        service_type: data.service_type ?? "",
        instagram: data.instagram ?? "",
        website: data.website ?? "",
        duration: data.duration ?? "",
        experience: data.experience ?? "",
        price: formatarValorParaCampo(data.price),
      });

      setCarregando(false);
    }

    carregarPerfil();

    return () => {
      componenteAtivo = false;
    };
  }, [router]);

  function atualizarCampo(
    campo: keyof TherapistForm,
    valor: string | number | null,
  ) {
    setForm((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));

    setErro("");
    setSucesso("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!form.id) {
      setErro("Não foi possível identificar o perfil profissional.");
      return;
    }

    if (!form.name.trim()) {
      setErro("Informe seu nome profissional.");
      return;
    }

    if (!form.speciality.trim()) {
      setErro("Informe sua especialidade.");
      return;
    }

    if (!form.city.trim()) {
      setErro("Informe sua cidade.");
      return;
    }

    if (!form.state.trim()) {
      setErro("Informe seu estado.");
      return;
    }

    const valorConsulta = converterValorParaNumero(form.price);

    if (form.price.trim() && valorConsulta === null) {
      setErro("Informe um valor de consulta válido.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("therapists")
      .update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        speciality: form.speciality.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        bio: form.bio.trim(),
        photo_url: form.photo_url.trim() || null,
        service_type: form.service_type.trim(),
        instagram: form.instagram.trim() || null,
        website: form.website.trim() || null,
        duration: form.duration.trim(),
        experience: form.experience.trim(),
        price: valorConsulta,
      })
      .eq("id", form.id)
      .eq("email", form.email);

    setSalvando(false);

    if (error) {
      console.error("Erro ao salvar perfil:", error);
      setErro(
        "Não foi possível salvar as alterações. Verifique as permissões da tabela no Supabase.",
      );
      return;
    }

    setForm((estadoAtual) => ({
      ...estadoAtual,
      price:
        valorConsulta === null
          ? ""
          : valorConsulta.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
    }));

    setSucesso("Perfil atualizado com sucesso.");
  }

  if (carregando) {
    return (
      <>
        <Sidebar />

        <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white md:ml-72">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

            <p className="mt-5 text-slate-300">
              Carregando seu perfil...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-slate-950 px-5 py-8 text-white sm:px-8 md:ml-72 lg:p-10">
        <section className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Perfil profissional
              </p>

              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Editar meu perfil
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Mantenha suas informações atualizadas para aumentar suas chances
                de ser encontrado por novos clientes.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-bold text-slate-200 transition hover:border-yellow-400 hover:text-yellow-400"
            >
              Voltar ao painel
            </Link>
          </div>

          {erro && (
            <div
              role="alert"
              className="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300"
            >
              {erro}
            </div>
          )}

          {sucesso && (
            <div
              role="status"
              className="mt-8 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5 text-emerald-300"
            >
              {sucesso}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-yellow-400">
                Informações principais
              </h2>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block font-bold">
                    Nome profissional
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      atualizarCampo("name", event.target.value)
                    }
                    placeholder="Seu nome profissional"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block font-bold">
                    E-mail da conta
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    disabled
                    className={`${inputClassName} cursor-not-allowed opacity-60`}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block font-bold">
                    Telefone ou WhatsApp
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      atualizarCampo("phone", event.target.value)
                    }
                    placeholder="(31) 99999-9999"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label
                    htmlFor="speciality"
                    className="mb-2 block font-bold"
                  >
                    Especialidade
                  </label>

                  <input
                    id="speciality"
                    type="text"
                    value={form.speciality}
                    onChange={(event) =>
                      atualizarCampo("speciality", event.target.value)
                    }
                    placeholder="Ex.: Numerologia"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="city" className="mb-2 block font-bold">
                    Cidade
                  </label>

                  <input
                    id="city"
                    type="text"
                    value={form.city}
                    onChange={(event) =>
                      atualizarCampo("city", event.target.value)
                    }
                    placeholder="Sua cidade"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="state" className="mb-2 block font-bold">
                    Estado
                  </label>

                  <input
                    id="state"
                    type="text"
                    value={form.state}
                    onChange={(event) =>
                      atualizarCampo("state", event.target.value)
                    }
                    placeholder="Minas Gerais"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-yellow-400">
                Apresentação profissional
              </h2>

              <div className="mt-7 space-y-6">
                <div>
                  <label htmlFor="bio" className="mb-2 block font-bold">
                    Biografia
                  </label>

                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(event) =>
                      atualizarCampo("bio", event.target.value)
                    }
                    placeholder="Conte sobre seu trabalho, sua abordagem e sua experiência."
                    rows={6}
                    className={`${inputClassName} resize-y`}
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    {form.bio.length} caracteres
                  </p>
                </div>

                <div>
                  <label htmlFor="photo_url" className="mb-2 block font-bold">
                    URL da foto
                  </label>

                  <input
                    id="photo_url"
                    type="url"
                    value={form.photo_url}
                    onChange={(event) =>
                      atualizarCampo("photo_url", event.target.value)
                    }
                    placeholder="https://..."
                    className={inputClassName}
                  />

                  <p className="mt-2 text-sm text-slate-500">
                    Mais adiante criaremos o envio direto da foto pelo
                    AuraMeets.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-yellow-400">
                Atendimento
              </h2>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="service_type"
                    className="mb-2 block font-bold"
                  >
                    Modalidade
                  </label>

                  <select
                    id="service_type"
                    value={form.service_type}
                    onChange={(event) =>
                      atualizarCampo("service_type", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Selecione</option>
                    <option value="Online">Online</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Online e Presencial">
                      Online e Presencial
                    </option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration" className="mb-2 block font-bold">
                    Duração da consulta
                  </label>

                  <input
                    id="duration"
                    type="text"
                    value={form.duration}
                    onChange={(event) =>
                      atualizarCampo("duration", event.target.value)
                    }
                    placeholder="Ex.: 40 minutos"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="mb-2 block font-bold">
                    Experiência
                  </label>

                  <input
                    id="experience"
                    type="text"
                    value={form.experience}
                    onChange={(event) =>
                      atualizarCampo("experience", event.target.value)
                    }
                    placeholder="Ex.: 40 anos de experiência"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="price" className="mb-2 block font-bold">
                    Valor da consulta
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                      R$
                    </span>

                    <input
                      id="price"
                      type="text"
                      inputMode="decimal"
                      value={form.price}
                      onChange={(event) =>
                        atualizarCampo("price", event.target.value)
                      }
                      placeholder="395,00"
                      className={`${inputClassName} pl-12`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <h2 className="text-2xl font-black text-yellow-400">
                Presença digital
              </h2>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="instagram" className="mb-2 block font-bold">
                    Instagram
                  </label>

                  <input
                    id="instagram"
                    type="text"
                    value={form.instagram}
                    onChange={(event) =>
                      atualizarCampo("instagram", event.target.value)
                    }
                    placeholder="@seuinstagram"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label htmlFor="website" className="mb-2 block font-bold">
                    Site
                  </label>

                  <input
                    id="website"
                    type="url"
                    value={form.website}
                    onChange={(event) =>
                      atualizarCampo("website", event.target.value)
                    }
                    placeholder="https://seusite.com.br"
                    className={inputClassName}
                  />
                </div>
              </div>
            </section>

            <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:flex sm:items-center sm:justify-between">
              <p className="mb-4 text-sm text-slate-400 sm:mb-0">
                Revise as informações antes de salvar.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-700 px-6 py-4 text-center font-bold text-slate-200 transition hover:border-slate-500"
                >
                  Cancelar
                </Link>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}