"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Servico = {
  id: string;
  therapist_id: string;
  name: string;
  category: string;
  description: string;
  cover_photo_url: string | null;
  online: boolean;
  in_person: boolean;
  duration_minutes: number;
  price: number;
  promotional_price: number | null;
  currency: string;
  status: "active" | "inactive" | "under_review";
  created_at: string;
};

type FormEdicao = {
  name: string;
  category: string;
  description: string;
  cover_photo_url: string;
  online: boolean;
  in_person: boolean;
  duration_minutes: string;
  price: string;
  promotional_price: string;
  currency: string;
};

function formatarPreco(valor: number, moeda: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: moeda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor);
}

function obterStatus(status: Servico["status"]) {
  if (status === "active") {
    return {
      texto: "Publicado",
      classe:
        "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
    };
  }

  if (status === "under_review") {
    return {
      texto: "Em análise",
      classe:
        "border-orange-400/40 bg-orange-400/10 text-orange-300",
    };
  }

  return {
    texto: "Oculto",
    classe:
      "border-slate-500 bg-slate-500/10 text-slate-300",
  };
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [terapeutaSlug, setTerapeutaSlug] =
    useState<string | null>(null);

  const [servicoEditando, setServicoEditando] =
    useState<Servico | null>(null);

  const [formEdicao, setFormEdicao] =
    useState<FormEdicao | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [acaoId, setAcaoId] = useState<string | null>(null);

  async function carregarServicos() {
    setCarregando(true);
    setErro("");

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setErro(
          "Sua sessão não foi encontrada. Entre novamente na sua conta.",
        );
        return;
      }

      const [
        { data: dadosServicos, error: erroConsulta },
        { data: terapeuta, error: erroTerapeuta },
      ] = await Promise.all([
        supabase
          .from("services")
          .select(
            `
              id,
              therapist_id,
              name,
              category,
              description,
              cover_photo_url,
              online,
              in_person,
              duration_minutes,
              price,
              promotional_price,
              currency,
              status,
              created_at
            `,
          )
          .eq("therapist_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("therapists")
          .select("slug")
          .eq("profile_id", user.id)
          .maybeSingle(),
      ]);

      if (erroConsulta) {
        console.error(
          "Erro ao carregar serviços:",
          erroConsulta,
        );

        setErro(
          `Não foi possível carregar os serviços: ${erroConsulta.message}`,
        );
        return;
      }

      if (erroTerapeuta) {
        console.error(
          "Erro ao localizar perfil público:",
          erroTerapeuta,
        );
      }

      setServicos(
        (dadosServicos ?? []) as Servico[],
      );

      setTerapeutaSlug(
        terapeuta?.slug ?? null,
      );
    } catch (error) {
      console.error(
        "Erro inesperado ao carregar serviços:",
        error,
      );

      setErro(
        "Ocorreu um erro inesperado. Atualize a página e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarServicos();
  }, []);

  function abrirEdicao(servico: Servico) {
    setMensagem("");
    setErro("");

    setServicoEditando(servico);

    setFormEdicao({
      name: servico.name,
      category: servico.category,
      description: servico.description,
      cover_photo_url:
        servico.cover_photo_url ?? "",
      online: servico.online,
      in_person: servico.in_person,
      duration_minutes: String(
        servico.duration_minutes,
      ),
      price: String(servico.price),
      promotional_price:
        servico.promotional_price !== null
          ? String(servico.promotional_price)
          : "",
      currency: servico.currency,
    });
  }

  function fecharEdicao() {
    if (salvando) return;

    setServicoEditando(null);
    setFormEdicao(null);
  }

  async function salvarEdicao() {
    if (!servicoEditando || !formEdicao) {
      return;
    }

    const duracao = Number(
      formEdicao.duration_minutes,
    );

    const preco = Number(
      formEdicao.price.replace(",", "."),
    );

    const precoPromocional =
      formEdicao.promotional_price.trim() !== ""
        ? Number(
            formEdicao.promotional_price.replace(
              ",",
              ".",
            ),
          )
        : null;

    if (!formEdicao.name.trim()) {
      setErro("Informe o nome do serviço.");
      return;
    }

    if (!formEdicao.category.trim()) {
      setErro("Informe a categoria do serviço.");
      return;
    }

    if (!formEdicao.description.trim()) {
      setErro("Informe a descrição do serviço.");
      return;
    }

    if (
      !Number.isFinite(duracao) ||
      duracao <= 0
    ) {
      setErro(
        "Informe uma duração válida em minutos.",
      );
      return;
    }

    if (
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      setErro("Informe um preço válido.");
      return;
    }

    if (
      precoPromocional !== null &&
      (!Number.isFinite(precoPromocional) ||
        precoPromocional < 0)
    ) {
      setErro(
        "Informe um preço promocional válido.",
      );
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setErro(
          "Sua sessão expirou. Entre novamente.",
        );
        return;
      }

      const { error } = await supabase
        .from("services")
        .update({
          name: formEdicao.name.trim(),
          category:
            formEdicao.category.trim(),
          description:
            formEdicao.description.trim(),
          cover_photo_url:
            formEdicao.cover_photo_url.trim() ||
            null,
          online: formEdicao.online,
          in_person: formEdicao.in_person,
          duration_minutes: duracao,
          price: preco,
          promotional_price:
            precoPromocional,
          currency:
            formEdicao.currency.trim() || "BRL",
        })
        .eq("id", servicoEditando.id)
        .eq("therapist_id", user.id);

      if (error) {
        console.error(
          "Erro ao atualizar serviço:",
          error,
        );

        setErro(
          `Não foi possível atualizar o serviço: ${error.message}`,
        );
        return;
      }

      setServicos((atuais) =>
        atuais.map((servico) =>
          servico.id === servicoEditando.id
            ? {
                ...servico,
                name: formEdicao.name.trim(),
                category:
                  formEdicao.category.trim(),
                description:
                  formEdicao.description.trim(),
                cover_photo_url:
                  formEdicao.cover_photo_url.trim() ||
                  null,
                online: formEdicao.online,
                in_person: formEdicao.in_person,
                duration_minutes: duracao,
                price: preco,
                promotional_price:
                  precoPromocional,
                currency:
                  formEdicao.currency.trim() ||
                  "BRL",
              }
            : servico,
        ),
      );

      setMensagem(
        "Serviço atualizado com sucesso.",
      );

      setServicoEditando(null);
      setFormEdicao(null);
    } catch (error) {
      console.error(
        "Erro inesperado ao atualizar serviço:",
        error,
      );

      setErro(
        "Ocorreu um erro inesperado ao atualizar o serviço.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarPublicacao(
    servico: Servico,
  ) {
    const novoStatus =
      servico.status === "active"
        ? "inactive"
        : "active";

    setAcaoId(servico.id);
    setErro("");
    setMensagem("");

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setErro(
          "Sua sessão expirou. Entre novamente.",
        );
        return;
      }

      const { error } = await supabase
        .from("services")
        .update({
          status: novoStatus,
        })
        .eq("id", servico.id)
        .eq("therapist_id", user.id);

      if (error) {
        console.error(
          "Erro ao alterar publicação:",
          error,
        );

        setErro(
          `Não foi possível alterar a publicação: ${error.message}`,
        );
        return;
      }

      setServicos((atuais) =>
        atuais.map((item) =>
          item.id === servico.id
            ? {
                ...item,
                status: novoStatus,
              }
            : item,
        ),
      );

      setMensagem(
        novoStatus === "active"
          ? "Serviço publicado no perfil."
          : "Serviço ocultado do perfil público.",
      );
    } catch (error) {
      console.error(
        "Erro inesperado ao alterar publicação:",
        error,
      );

      setErro(
        "Ocorreu um erro inesperado ao alterar a publicação.",
      );
    } finally {
      setAcaoId(null);
    }
  }

  async function excluirServico(
    servico: Servico,
  ) {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir "${servico.name}"? Esta ação não poderá ser desfeita.`,
    );

    if (!confirmou) {
      return;
    }

    setAcaoId(servico.id);
    setErro("");
    setMensagem("");

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setErro(
          "Sua sessão expirou. Entre novamente.",
        );
        return;
      }

      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", servico.id)
        .eq("therapist_id", user.id);

      if (error) {
        console.error(
          "Erro ao excluir serviço:",
          error,
        );

        setErro(
          `Não foi possível excluir o serviço: ${error.message}`,
        );
        return;
      }

      setServicos((atuais) =>
        atuais.filter(
          (item) => item.id !== servico.id,
        ),
      );

      setMensagem(
        "Serviço excluído com sucesso.",
      );
    } catch (error) {
      console.error(
        "Erro inesperado ao excluir serviço:",
        error,
      );

      setErro(
        "Ocorreu um erro inesperado ao excluir o serviço.",
      );
    } finally {
      setAcaoId(null);
    }
  }

  const totalServicos = servicos.length;

  const totalAtivos = servicos.filter(
    (servico) =>
      servico.status === "active",
  ).length;

  const totalEmAnalise = servicos.filter(
    (servico) =>
      servico.status === "under_review",
  ).length;

  return (
    <main className="min-h-screen bg-[#050816] p-6 text-white lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-yellow-400">
              Dashboard do Terapeuta
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Meus Serviços
            </h1>

            <p className="mt-3 max-w-3xl leading-7 text-slate-300">
              Cadastre, edite e escolha quais
              serviços deseja publicar no seu
              perfil do AuraMeets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {terapeutaSlug && (
              <Link
                href={`/terapeutas/${terapeutaSlug}`}
                target="_blank"
                className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-6 py-4 font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400"
              >
                Ver meu perfil
              </Link>
            )}

            <Link
              href="/dashboard-terapeuta/servicos/novo"
              className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300"
            >
              + Novo Serviço
            </Link>
          </div>
        </div>

        {mensagem && (
          <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="mt-8 rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-red-300">
            {erro}
          </div>
        )}

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-6">
            <p className="text-sm text-slate-400">
              Total de Serviços
            </p>

            <p className="mt-3 text-4xl font-black text-yellow-400">
              {carregando
                ? "—"
                : totalServicos}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-6">
            <p className="text-sm text-slate-400">
              Publicados
            </p>

            <p className="mt-3 text-4xl font-black text-emerald-400">
              {carregando
                ? "—"
                : totalAtivos}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-[#111A33] p-6">
            <p className="text-sm text-slate-400">
              Em análise
            </p>

            <p className="mt-3 text-4xl font-black text-orange-400">
              {carregando
                ? "—"
                : totalEmAnalise}
            </p>
          </div>
        </section>

        {carregando && (
          <section className="mt-10 rounded-3xl border border-slate-700 bg-[#111A33] p-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

            <p className="mt-6 font-bold text-slate-300">
              Carregando seus serviços...
            </p>
          </section>
        )}

        {!carregando &&
          !erro &&
          servicos.length === 0 && (
            <section className="mt-10 rounded-3xl border border-dashed border-slate-700 bg-[#111A33] p-8 text-center sm:p-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#1B2444] text-5xl">
                ✨
              </div>

              <h2 className="mt-8 text-3xl font-black">
                Você ainda não possui
                serviços cadastrados.
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Cadastre seu primeiro serviço
                para começar a preparar seu
                perfil no AuraMeets.
              </p>

              <Link
                href="/dashboard-terapeuta/servicos/novo"
                className="mt-10 inline-flex items-center justify-center rounded-xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300"
              >
                Cadastrar meu primeiro serviço
              </Link>
            </section>
          )}

        {!carregando &&
          servicos.length > 0 && (
            <section className="mt-10">
              <div className="mb-5">
                <h2 className="text-2xl font-black">
                  Serviços cadastrados
                </h2>

                <p className="mt-2 text-slate-400">
                  Edite, publique, oculte ou
                  exclua os serviços do seu
                  perfil.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {servicos.map((servico) => {
                  const status =
                    obterStatus(
                      servico.status,
                    );

                  const executando =
                    acaoId === servico.id;

                  return (
                    <article
                      key={servico.id}
                      className="overflow-hidden rounded-3xl border border-slate-700 bg-[#111A33] shadow-xl"
                    >
                      <div className="flex h-52 items-center justify-center overflow-hidden bg-[#1B2444]">
                        {servico.cover_photo_url ? (
                          <img
                            src={
                              servico.cover_photo_url
                            }
                            alt={`Foto do serviço ${servico.name}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-5xl">
                              ✨
                            </div>

                            <p className="mt-3 text-sm font-bold text-slate-400">
                              Foto do serviço
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">
                            {servico.category}
                          </p>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-black ${status.classe}`}
                          >
                            {status.texto}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-black">
                          {servico.name}
                        </h3>

                        <p className="mt-3 line-clamp-3 leading-7 text-slate-300">
                          {servico.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {servico.online && (
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                              Online
                            </span>
                          )}

                          {servico.in_person && (
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                              Presencial
                            </span>
                          )}

                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                            {
                              servico.duration_minutes
                            }{" "}
                            minutos
                          </span>
                        </div>

                        <div className="mt-6 border-t border-slate-700 pt-5">
                          {servico.promotional_price !==
                          null ? (
                            <div>
                              <p className="text-sm text-slate-400 line-through">
                                {formatarPreco(
                                  Number(
                                    servico.price,
                                  ),
                                  servico.currency,
                                )}
                              </p>

                              <p className="mt-1 text-3xl font-black text-yellow-400">
                                {formatarPreco(
                                  Number(
                                    servico.promotional_price,
                                  ),
                                  servico.currency,
                                )}
                              </p>
                            </div>
                          ) : (
                            <p className="text-3xl font-black text-yellow-400">
                              {formatarPreco(
                                Number(
                                  servico.price,
                                ),
                                servico.currency,
                              )}
                            </p>
                          )}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              abrirEdicao(
                                servico,
                              )
                            }
                            disabled={
                              executando
                            }
                            className="rounded-xl border border-slate-600 px-4 py-3 font-bold text-white transition hover:border-yellow-400 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void alterarPublicacao(
                                servico,
                              )
                            }
                            disabled={
                              executando
                            }
                            className={
                              servico.status ===
                              "active"
                                ? "rounded-xl border border-orange-400/40 px-4 py-3 font-bold text-orange-300 transition hover:bg-orange-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                                : "rounded-xl border border-emerald-400/40 px-4 py-3 font-bold text-emerald-300 transition hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                            }
                          >
                            {servico.status ===
                            "active"
                              ? "Ocultar"
                              : "Publicar"}
                          </button>

                          {terapeutaSlug && (
                            <Link
                              href={`/terapeutas/${terapeutaSlug}`}
                              target="_blank"
                              className="rounded-xl border border-purple-400/40 px-4 py-3 text-center font-bold text-purple-200 transition hover:bg-purple-400/10"
                            >
                              Ver no perfil
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              void excluirServico(
                                servico,
                              )
                            }
                            disabled={
                              executando
                            }
                            className="rounded-xl border border-red-500/40 px-4 py-3 font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
      </div>

      {servicoEditando &&
        formEdicao && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-700 bg-[#111A33] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
                    Editar serviço
                  </p>

                  <h2 className="mt-3 text-3xl font-black">
                    Atualize seu atendimento
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    fecharEdicao
                  }
                  disabled={salvando}
                  className="rounded-xl border border-slate-600 px-4 py-2 font-bold text-slate-300 hover:text-white disabled:opacity-50"
                >
                  Fechar
                </button>
              </div>

              <div className="mt-8 grid gap-6">
                <label>
                  <span className="mb-2 block font-bold">
                    Nome do serviço
                  </span>

                  <input
                    value={
                      formEdicao.name
                    }
                    onChange={(event) =>
                      setFormEdicao({
                        ...formEdicao,
                        name: event
                          .target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-bold">
                    Categoria
                  </span>

                  <input
                    value={
                      formEdicao.category
                    }
                    onChange={(event) =>
                      setFormEdicao({
                        ...formEdicao,
                        category:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-bold">
                    Descrição
                  </span>

                  <textarea
                    value={
                      formEdicao.description
                    }
                    onChange={(event) =>
                      setFormEdicao({
                        ...formEdicao,
                        description:
                          event.target
                            .value,
                      })
                    }
                    rows={5}
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />
                </label>

                <label>
                  <span className="mb-2 block font-bold">
                    URL da foto
                  </span>

                  <input
                    value={
                      formEdicao.cover_photo_url
                    }
                    onChange={(event) =>
                      setFormEdicao({
                        ...formEdicao,
                        cover_photo_url:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />
                </label>

                <div className="grid gap-6 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block font-bold">
                      Duração em minutos
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={
                        formEdicao.duration_minutes
                      }
                      onChange={(event) =>
                        setFormEdicao({
                          ...formEdicao,
                          duration_minutes:
                            event.target
                              .value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block font-bold">
                      Moeda
                    </span>

                    <select
                      value={
                        formEdicao.currency
                      }
                      onChange={(event) =>
                        setFormEdicao({
                          ...formEdicao,
                          currency:
                            event.target
                              .value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                    >
                      <option value="BRL">
                        BRL — Real
                      </option>
                      <option value="USD">
                        USD — Dólar
                      </option>
                      <option value="EUR">
                        EUR — Euro
                      </option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <label>
                    <span className="mb-2 block font-bold">
                      Preço
                    </span>

                    <input
                      value={
                        formEdicao.price
                      }
                      onChange={(event) =>
                        setFormEdicao({
                          ...formEdicao,
                          price:
                            event.target
                              .value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                    />
                  </label>

                  <label>
                    <span className="mb-2 block font-bold">
                      Preço promocional
                    </span>

                    <input
                      value={
                        formEdicao.promotional_price
                      }
                      onChange={(event) =>
                        setFormEdicao({
                          ...formEdicao,
                          promotional_price:
                            event.target
                              .value,
                        })
                      }
                      placeholder="Opcional"
                      className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap gap-6 rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        formEdicao.online
                      }
                      onChange={(event) =>
                        setFormEdicao({
                          ...formEdicao,
                          online:
                            event.target
                              .checked,
                        })
                      }
                    />

                    <span className="font-bold">
                      Online
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        formEdicao.in_person
                      }
                      onChange={(event) =>
                        setFormEdicao({
                          ...formEdicao,
                          in_person:
                            event.target
                              .checked,
                        })
                      }
                    />

                    <span className="font-bold">
                      Presencial
                    </span>
                  </label>
                </div>
              </div>

              {erro && (
                <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
                  {erro}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    fecharEdicao
                  }
                  disabled={salvando}
                  className="rounded-xl border border-slate-600 px-6 py-4 font-bold text-white disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void salvarEdicao()
                  }
                  disabled={salvando}
                  className="rounded-xl bg-yellow-400 px-8 py-4 font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}