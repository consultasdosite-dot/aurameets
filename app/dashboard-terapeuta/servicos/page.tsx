

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
  payment_url: string | null;
  currency: string;
  status: "active" | "inactive" | "under_review";
  created_at: string;
  display_order: number | null;
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

  const [auraAberta, setAuraAberta] = useState(false);
  const [auraTopico, setAuraTopico] = useState<string | null>(null);

  const [auraServicoId, setAuraServicoId] = useState("");
  const [auraPedidoFoto, setAuraPedidoFoto] = useState("");
  const [auraGerandoFoto, setAuraGerandoFoto] = useState(false);
  const [auraSalvandoFoto, setAuraSalvandoFoto] = useState(false);
  const [auraImagemUrl, setAuraImagemUrl] = useState("");
  const [auraErroFoto, setAuraErroFoto] = useState("");

  const auraAjuda: Record<string, { titulo: string; passos: string[] }> = {
    novo: {
      titulo: "Cadastrar um serviço",
      passos: [
        "Clique no botão + Novo Serviço.",
        "Escreva o nome do atendimento que você oferece.",
        "Preencha as informações pedidas, uma de cada vez.",
        "No final, confira e salve.",
      ],
    },
    foto: {
      titulo: "Ajude-me com a foto",
      passos: [
        "Escolha abaixo qual serviço precisa de uma foto.",
        "Se quiser, conte em poucas palavras como imagina a imagem.",
        "A AURA cria a foto para você.",
        "Confira a imagem e toque em USAR ESTA FOTO.",
      ],
    },
    descricao: {
      titulo: "Escrever a descrição",
      passos: [
        "Explique primeiro o que é o seu atendimento.",
        "Depois diga para quem ele é indicado.",
        "Conte de forma simples como a pessoa será atendida.",
        "Evite textos muito longos. Clareza ajuda a vender.",
      ],
    },
    preco: {
      titulo: "Colocar o preço",
      passos: [
        "No campo Preço, coloque o valor normal do atendimento.",
        "Se houver desconto, use também Preço promocional.",
        "Confira a moeda: Real, Dólar ou Euro.",
        "Salve as alterações.",
      ],
    },
    publicar: {
      titulo: "Publicar ou ocultar",
      passos: [
        "Encontre o serviço na lista abaixo.",
        "Se aparecer Publicar, clique para mostrar no seu perfil.",
        "Se aparecer Ocultar, o serviço já está publicado.",
        "Você pode ocultar e publicar novamente quando quiser.",
      ],
    },
  };

  function fecharAura() {
    if (auraGerandoFoto || auraSalvandoFoto) {
      return;
    }

    setAuraAberta(false);
    setAuraTopico(null);
    setAuraServicoId("");
    setAuraPedidoFoto("");
    setAuraImagemUrl("");
    setAuraErroFoto("");
  }

  async function gerarFotoComAura() {
    const servico = servicos.find(
      (item) => item.id === auraServicoId,
    );

    if (!servico) {
      setAuraErroFoto(
        "Escolha primeiro o serviço que precisa de uma foto.",
      );
      return;
    }

    setAuraGerandoFoto(true);
    setAuraErroFoto("");
    setAuraImagemUrl("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setAuraErroFoto(
          "Sua sessão expirou. Entre novamente no AuraMeets.",
        );
        return;
      }

      const response = await fetch(
        "/api/aura/imagem",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: servico.id,
            serviceName: servico.name,
            category: servico.category,
            description: servico.description,
            request: auraPedidoFoto.trim(),
          }),
        },
      );

      const result = (await response.json()) as {
        imageUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.imageUrl) {
        throw new Error(
          result.error ||
            "A AURA não conseguiu criar a imagem agora.",
        );
      }

      setAuraImagemUrl(result.imageUrl);
    } catch (error) {
      setAuraErroFoto(
        error instanceof Error
          ? error.message
          : "A AURA não conseguiu criar a imagem agora.",
      );
    } finally {
      setAuraGerandoFoto(false);
    }
  }

  async function usarFotoDaAura() {
    if (!auraServicoId || !auraImagemUrl) {
      setAuraErroFoto(
        "Crie uma imagem antes de usar esta opção.",
      );
      return;
    }

    setAuraSalvandoFoto(true);
    setAuraErroFoto("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setAuraErroFoto(
          "Sua sessão expirou. Entre novamente no AuraMeets.",
        );
        return;
      }

      const { error } = await supabase
        .from("services")
        .update({
          cover_photo_url: auraImagemUrl,
        })
        .eq("id", auraServicoId)
        .eq("therapist_id", user.id);

      if (error) {
        throw new Error(
          `Não foi possível salvar a foto: ${error.message}`,
        );
      }

      setServicos((atuais) =>
        atuais.map((servico) =>
          servico.id === auraServicoId
            ? {
                ...servico,
                cover_photo_url: auraImagemUrl,
              }
            : servico,
        ),
      );

      setMensagem(
        "A foto criada pela AURA foi aplicada ao seu serviço.",
      );

      fecharAura();
    } catch (error) {
      setAuraErroFoto(
        error instanceof Error
          ? error.message
          : "Não foi possível aplicar a foto ao serviço.",
      );
    } finally {
      setAuraSalvandoFoto(false);
    }
  }

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
              payment_url,
              currency,
              status,
              created_at,
              display_order
            `,
          )
          .eq("therapist_id", user.id)
          .order("display_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true }),

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

      setServicos((dadosServicos ?? []) as Servico[]);

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

    if (formEdicao.description.length > 2000) {
      setErro("A descrição pode ter no máximo 2.000 caracteres.");
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

  async function moverServico(
    index: number,
    direcao: -1 | 1,
  ) {
    const novoIndex = index + direcao;

    if (novoIndex < 0 || novoIndex >= servicos.length) {
      return;
    }

    const servicoAtual = servicos[index];
    const servicoDestino = servicos[novoIndex];

    const ordemAtual = servicoAtual.display_order ?? index + 1;
    const ordemDestino = servicoDestino.display_order ?? novoIndex + 1;

    setAcaoId(servicoAtual.id);
    setErro("");
    setMensagem("");

    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setErro("Sua sessão expirou. Entre novamente.");
        return;
      }

      const [resultadoAtual, resultadoDestino] = await Promise.all([
        supabase
          .from("services")
          .update({ display_order: ordemDestino })
          .eq("id", servicoAtual.id)
          .eq("therapist_id", user.id),

        supabase
          .from("services")
          .update({ display_order: ordemAtual })
          .eq("id", servicoDestino.id)
          .eq("therapist_id", user.id),
      ]);

      if (resultadoAtual.error || resultadoDestino.error) {
        const mensagemErro =
          resultadoAtual.error?.message ||
          resultadoDestino.error?.message ||
          "Erro ao alterar a ordem.";

        throw new Error(mensagemErro);
      }

      const novaLista = [...servicos];

      novaLista[index] = {
        ...servicoDestino,
        display_order: ordemAtual,
      };

      novaLista[novoIndex] = {
        ...servicoAtual,
        display_order: ordemDestino,
      };

      setServicos(novaLista);
      setMensagem("Ordem dos serviços atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao alterar ordem dos serviços:", error);

      setErro(
        error instanceof Error
          ? `Não foi possível alterar a ordem: ${error.message}`
          : "Não foi possível alterar a ordem dos serviços.",
      );

      await carregarServicos();
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

        <section className="mt-8 rounded-3xl border border-yellow-300 bg-yellow-400 p-5 text-black sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black">
                Precisa de ajuda?
              </p>
              <h2 className="mt-2 text-2xl font-black text-black sm:text-3xl">
                Sou AURA, sua assistente virtual
              </h2>
              <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-black/80">
                Eu explico devagar, uma coisa por vez.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setAuraAberta(true);
                setAuraTopico(null);
                setAuraErroFoto("");
              }}
              className="min-h-16 rounded-2xl bg-[#050816] px-8 py-4 text-lg font-black text-yellow-400 transition hover:bg-black"
            >
              PEÇA AJUDA
            </button>
          </div>
        </section>

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
                  Use Subir e Descer para escolher a ordem dos serviços.
                  Você também pode editar, publicar, ocultar ou excluir.
                </p>
              </div>

              <div className="grid gap-6">
                {servicos.map((servico, index) => {
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
                      <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-[#1B2444]">
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

                      <div className="flex-1 p-6 sm:p-7">
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

                        <p className="mt-3 whitespace-pre-line leading-7 text-slate-300">
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

                        {servico.payment_url?.trim() && (
                          <a
                            href={servico.payment_url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 flex min-h-[54px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_12px_30px_rgba(147,51,234,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
                          >
                            QUERO COMPRAR
                          </a>
                        )}

                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              void moverServico(index, -1)
                            }
                            disabled={index === 0 || acaoId !== null}
                            className="rounded-xl border border-yellow-400/40 px-4 py-3 font-bold text-yellow-300 transition hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↑ Subir
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void moverServico(index, 1)
                            }
                            disabled={index === servicos.length - 1 || acaoId !== null}
                            className="rounded-xl border border-yellow-400/40 px-4 py-3 font-bold text-yellow-300 transition hover:bg-yellow-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            ↓ Descer
                          </button>

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

      {auraAberta && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
          <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-yellow-400/30 bg-[#111A33] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-yellow-400">
                  AURA
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  {auraTopico ? auraAjuda[auraTopico].titulo : "Olá! O que você quer fazer?"}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharAura}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-600 text-2xl font-bold text-white"
                aria-label="Fechar ajuda"
              >
                ×
              </button>
            </div>

            {!auraTopico ? (
              <div className="mt-7 grid gap-3">
                {[
                  ["novo", "Quero cadastrar um serviço"],
                  ["foto", "AJUDE-ME COM A FOTO"],
                  ["descricao", "Como escrevo a descrição?"],
                  ["preco", "Como coloco o preço?"],
                  ["publicar", "Como publico meu serviço?"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAuraTopico(id)}
                    className="min-h-16 rounded-2xl border border-slate-600 bg-slate-950/50 px-5 py-4 text-left text-lg font-bold text-white transition hover:border-yellow-400 hover:text-yellow-300"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : auraTopico === "foto" ? (
              <div className="mt-7">
                {servicos.length === 0 ? (
                  <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
                    <p className="text-lg font-bold text-white">
                      Primeiro cadastre um serviço.
                    </p>
                    <p className="mt-2 leading-7 text-slate-300">
                      Depois volte aqui e a AURA poderá criar a foto para ele.
                    </p>
                    <Link
                      href="/dashboard-terapeuta/servicos/novo"
                      className="mt-5 inline-flex min-h-14 items-center justify-center rounded-xl bg-yellow-400 px-6 py-3 font-black text-black"
                    >
                      CADASTRAR SERVIÇO
                    </Link>
                  </div>
                ) : (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-lg font-black text-white">
                        1. Qual serviço precisa da foto?
                      </span>
                      <select
                        value={auraServicoId}
                        onChange={(event) => {
                          setAuraServicoId(event.target.value);
                          setAuraImagemUrl("");
                          setAuraErroFoto("");
                        }}
                        className="w-full rounded-2xl border border-slate-600 bg-slate-950 px-4 py-4 text-lg text-white outline-none focus:border-yellow-400"
                      >
                        <option value="">Escolha um serviço</option>
                        {servicos.map((servico) => (
                          <option key={servico.id} value={servico.id}>
                            {servico.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="mt-6 block">
                      <span className="mb-2 block text-lg font-black text-white">
                        2. Quer pedir algo especial?
                      </span>
                      <textarea
                        value={auraPedidoFoto}
                        onChange={(event) =>
                          setAuraPedidoFoto(event.target.value)
                        }
                        maxLength={500}
                        rows={4}
                        placeholder="Exemplo: quero uma imagem acolhedora, elegante e com sensação de tranquilidade."
                        className="w-full rounded-2xl border border-slate-600 bg-slate-950 px-4 py-4 text-lg leading-7 text-white outline-none placeholder:text-slate-500 focus:border-yellow-400"
                      />
                      <p className="mt-2 text-sm text-slate-400">
                        Se preferir, deixe em branco. A AURA cria por você.
                      </p>
                    </label>

                    {auraErroFoto && (
                      <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">
                        {auraErroFoto}
                      </div>
                    )}

                    {!auraImagemUrl ? (
                      <button
                        type="button"
                        onClick={() => void gerarFotoComAura()}
                        disabled={auraGerandoFoto || !auraServicoId}
                        className="mt-6 min-h-16 w-full rounded-2xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {auraGerandoFoto
                          ? "AURA ESTÁ CRIANDO SUA FOTO..."
                          : "CRIAR MINHA FOTO"}
                      </button>
                    ) : (
                      <div className="mt-6">
                        <p className="text-lg font-black text-white">
                          3. Veja como ficou
                        </p>

                        <div className="mt-3 overflow-hidden rounded-2xl border border-yellow-400/30 bg-slate-950">
                          <div className="aspect-video w-full">
                            <img
                              src={auraImagemUrl}
                              alt="Foto criada pela AURA para o serviço"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>

                        <p className="mt-3 text-base leading-7 text-slate-300">
                          Gostou? Toque em USAR ESTA FOTO. Se não gostou, peça outra.
                        </p>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAuraImagemUrl("");
                              void gerarFotoComAura();
                            }}
                            disabled={auraGerandoFoto || auraSalvandoFoto}
                            className="min-h-14 rounded-2xl border border-yellow-400/50 px-5 py-3 font-black text-yellow-300 disabled:opacity-50"
                          >
                            CRIAR OUTRA
                          </button>

                          <button
                            type="button"
                            onClick={() => void usarFotoDaAura()}
                            disabled={auraSalvandoFoto || auraGerandoFoto}
                            className="min-h-14 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black disabled:opacity-50"
                          >
                            {auraSalvandoFoto
                              ? "SALVANDO..."
                              : "USAR ESTA FOTO"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setAuraTopico(null);
                    setAuraServicoId("");
                    setAuraPedidoFoto("");
                    setAuraImagemUrl("");
                    setAuraErroFoto("");
                  }}
                  disabled={auraGerandoFoto || auraSalvandoFoto}
                  className="mt-6 min-h-14 w-full rounded-2xl border border-slate-600 px-5 py-3 font-bold text-white disabled:opacity-50"
                >
                  VOLTAR
                </button>
              </div>
            ) : (
              <div className="mt-7">
                <div className="space-y-4">
                  {auraAjuda[auraTopico].passos.map((passo, index) => (
                    <div
                      key={passo}
                      className="flex gap-4 rounded-2xl border border-slate-700 bg-slate-950/50 p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-lg font-black text-black">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-lg leading-7 text-white">
                        {passo}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setAuraTopico(null)}
                    className="min-h-14 rounded-2xl border border-slate-600 px-5 py-3 font-bold text-white"
                  >
                    VOLTAR
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuraTopico(null)}
                    className="min-h-14 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black"
                  >
                    NÃO ENTENDI
                  </button>
                </div>

                <p className="mt-4 text-center text-sm leading-6 text-slate-400">
                  Se não ficou claro, toque em NÃO ENTENDI e escolha novamente o que precisa.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

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
                    value={formEdicao.description}
                    onChange={(event) =>
                      setFormEdicao({
                        ...formEdicao,
                        description: event.target.value,
                      })
                    }
                    rows={10}
                    maxLength={2000}
                    placeholder="Descreva o serviço com clareza, benefícios, formato do atendimento e para quem ele é indicado."
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />

                  <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-400">
                      Descrição completa do serviço. Limite máximo de 2.000 caracteres.
                    </span>
                    <span className="font-bold text-yellow-400">
                      {formEdicao.description.length} / 2000
                    </span>
                  </div>
                </label>

                <label>
                  <span className="mb-2 block font-bold">
                    URL da foto
                  </span>

                  <input
                    value={formEdicao.cover_photo_url}
                    onChange={(event) =>
                      setFormEdicao({
                        ...formEdicao,
                        cover_photo_url: event.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-600 bg-slate-950 px-4 py-3 text-white outline-none focus:border-yellow-400"
                  />

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    TAMANHO RECOMENDADO: 1200 × 675 PX — FORMATO HORIZONTAL — 16:9. Use uma imagem horizontal, nítida e sem textos próximos das bordas.
                  </p>

                  {formEdicao.cover_photo_url.trim() && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-[#1B2444]">
                      <div className="aspect-video w-full">
                        <img
                          src={formEdicao.cover_photo_url}
                          alt="Prévia da foto do serviço"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="px-4 py-3 text-xs text-slate-400">
                        Prévia no formato recomendado 16:9 (1200 × 675). A imagem é exibida proporcionalmente, sem ser esticada.
                      </p>
                    </div>
                  )}
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