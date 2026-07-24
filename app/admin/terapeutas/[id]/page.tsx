"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Terapeuta = {
  id: number;
  created_at: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  speciality: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  photo_url: string | null;
  verified: boolean | null;
  rating: number | null;
  price: number | string | null;
  plan_status: string | null;
  active: boolean | null;
  service_type: string | null;
  instagram: string | null;
  website: string | null;
  plan: string | null;
  views: number | null;
  appointments: number | null;
  messages: number | null;
  duration: string | null;
  experience: string | null;
  slug: string | null;
  profile_id: string | null;
  approval_status: string | null;
  whatsapp_group_joined: boolean | null;
  whatsapp_group_joined_at: string | null;
  admin_notes: string | null;
  review_required: boolean | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profile_photo_url: string | null;
  presentation_video_url: string | null;
  professional_headline: string | null;
  main_education: string | null;
  education_institution: string | null;
  education_year: number | null;
};

type TipoAcao =
  | "aprovar"
  | "reprovar"
  | "ativar"
  | "suspender"
  | "salvar-observacoes"
  | null;

export default function TerapeutaDetalhesPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params?.id;

  const [terapeuta, setTerapeuta] = useState<Terapeuta | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [acaoEmAndamento, setAcaoEmAndamento] =
    useState<TipoAcao>(null);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (id) {
      carregarTerapeuta();
    }
  }, [id]);

  async function verificarAdministrador() {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      router.replace("/login");
      return null;
    }

    const { data: perfil, error: erroPerfil } = await supabase
      .from("profiles")
      .select("id,user_type")
      .eq("id", user.id)
      .single();

    if (erroPerfil || !perfil || perfil.user_type !== "admin") {
      router.replace("/");
      return null;
    }

    return user;
  }

  async function carregarTerapeuta() {
    setLoading(true);
    setErro("");
    setMensagem("");

    try {
      const usuario = await verificarAdministrador();

      if (!usuario) {
        return;
      }

      const idNumerico = Number(id);

      if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
        setErro("O identificador do terapeuta é inválido.");
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .select("*")
        .eq("id", idNumerico)
        .single();

      if (error) {
        throw error;
      }

      const terapeutaCarregado = data as Terapeuta;

      setTerapeuta(terapeutaCarregado);
      setObservacoes(terapeutaCarregado.admin_notes || "");
    } catch (error) {
      console.error("Erro ao carregar terapeuta:", error);

      setErro(
        "Não foi possível carregar os dados deste terapeuta. Verifique se o cadastro existe e se o administrador possui permissão de leitura."
      );
    } finally {
      setLoading(false);
    }
  }

  async function atualizarTerapeuta(
    acao: Exclude<TipoAcao, null>,
    alteracoes: Partial<Terapeuta>,
    mensagemSucesso: string
  ) {
    if (!terapeuta) {
      return;
    }

    setAcaoEmAndamento(acao);
    setErro("");
    setMensagem("");

    try {
      const usuario = await verificarAdministrador();

      if (!usuario) {
        return;
      }

      const { data, error } = await supabase
        .from("therapists")
        .update(alteracoes)
        .eq("id", terapeuta.id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      const terapeutaAtualizado = data as Terapeuta;

      setTerapeuta(terapeutaAtualizado);
      setObservacoes(terapeutaAtualizado.admin_notes || "");
      setMensagem(mensagemSucesso);
    } catch (error) {
      console.error("Erro ao atualizar terapeuta:", error);

      setErro(
        "A alteração não pôde ser salva. Verifique as políticas RLS de atualização da tabela therapists."
      );
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  async function aprovarTerapeuta() {
    if (!terapeuta) {
      return;
    }

    const confirmou = window.confirm(
      `Deseja aprovar o cadastro de ${terapeuta.name}?`
    );

    if (!confirmou) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await atualizarTerapeuta(
      "aprovar",
      {
        approval_status: "aprovado",
        active: true,
        verified: true,
        review_required: false,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
      },
      "O cadastro foi aprovado com sucesso."
    );
  }

  async function reprovarTerapeuta() {
    if (!terapeuta) {
      return;
    }

    const confirmou = window.confirm(
      `Deseja reprovar o cadastro de ${terapeuta.name}?`
    );

    if (!confirmou) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await atualizarTerapeuta(
      "reprovar",
      {
        approval_status: "reprovado",
        active: false,
        verified: false,
        review_required: false,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
      },
      "O cadastro foi reprovado."
    );
  }

  async function alterarSituacao() {
    if (!terapeuta) {
      return;
    }

    const estaAtivo = terapeuta.active !== false;
    const novaSituacao = !estaAtivo;

    const confirmou = window.confirm(
      novaSituacao
        ? `Deseja reativar ${terapeuta.name}?`
        : `Deseja suspender temporariamente ${terapeuta.name}?`
    );

    if (!confirmou) {
      return;
    }

    await atualizarTerapeuta(
      novaSituacao ? "ativar" : "suspender",
      {
        active: novaSituacao,
      },
      novaSituacao
        ? "O terapeuta foi reativado."
        : "O terapeuta foi suspenso temporariamente."
    );
  }

  async function salvarObservacoes() {
    if (!terapeuta) {
      return;
    }

    await atualizarTerapeuta(
      "salvar-observacoes",
      {
        admin_notes: observacoes.trim() || null,
      },
      "As observações administrativas foram salvas."
    );
  }

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-amber-300" />

          <p className="mt-5 text-sm font-medium text-slate-400">
            Carregando ficha do terapeuta...
          </p>
        </div>
      </section>
    );
  }

  if (!terapeuta) {
    return (
      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
          <WarningIcon className="h-8 w-8" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">
          Terapeuta não encontrado
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
          {erro ||
            "O cadastro solicitado não existe ou não pôde ser carregado."}
        </p>

        <Link
          href="/admin/terapeutas"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar aos terapeutas
        </Link>
      </section>
    );
  }

  const foto =
    terapeuta.profile_photo_url || terapeuta.photo_url || null;

  const estaAtivo = terapeuta.active !== false;
  const statusAprovacao = normalizarStatusAprovacao(
    terapeuta.approval_status
  );

  return (
    <div className="space-y-7">
      {/* NAVEGAÇÃO */}
      <div>
        <Link
          href="/admin/terapeutas"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-amber-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para terapeutas
        </Link>
      </div>

      {/* MENSAGENS */}
      {mensagem && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

            <div>
              <p className="font-semibold text-emerald-200">
                Alteração concluída
              </p>

              <p className="mt-1 text-sm text-emerald-200/70">
                {mensagem}
              </p>
            </div>
          </div>
        </div>
      )}

      {erro && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div>
              <p className="font-semibold text-red-200">
                Não foi possível concluir
              </p>

              <p className="mt-1 text-sm text-red-200/70">{erro}</p>
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO DO PERFIL */}
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="border-b border-white/10 bg-gradient-to-r from-amber-300/10 via-slate-900/40 to-violet-400/10 px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {foto ? (
                <img
                  src={foto}
                  alt={`Foto de ${terapeuta.name}`}
                  className="h-24 w-24 shrink-0 rounded-3xl border border-white/10 object-cover shadow-xl"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/10 text-2xl font-black text-amber-300">
                  {obterIniciais(terapeuta.name)}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {terapeuta.name}
                  </h1>

                  {terapeuta.verified && (
                    <VerifiedIcon className="h-6 w-6 text-sky-400" />
                  )}
                </div>

                <p className="mt-2 text-base font-medium text-amber-300">
                  {terapeuta.professional_headline ||
                    terapeuta.speciality ||
                    "Profissional AuraMeets"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ApprovalBadge
                    status={terapeuta.approval_status}
                  />

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                      estaAtivo
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        estaAtivo
                          ? "bg-emerald-300"
                          : "bg-slate-500"
                      }`}
                    />
                    {estaAtivo ? "Ativo" : "Suspenso"}
                  </span>

                  <PlanBadge plano={terapeuta.plan} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:justify-end">
              {terapeuta.slug && (
                <Link
                  href={`/terapeutas/${terapeuta.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Perfil público
                </Link>
              )}

              <button
                type="button"
                onClick={alterarSituacao}
                disabled={
                  acaoEmAndamento === "ativar" ||
                  acaoEmAndamento === "suspender"
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                  estaAtivo
                    ? "border border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/15"
                    : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                }`}
              >
                {estaAtivo ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}

                {acaoEmAndamento === "ativar" ||
                acaoEmAndamento === "suspender"
                  ? "Salvando..."
                  : estaAtivo
                    ? "Suspender"
                    : "Reativar"}
              </button>
            </div>
          </div>
        </div>

        {/* INDICADORES */}
        <div className="grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <ProfileMetric
            label="Avaliação"
            value={formatarAvaliacao(terapeuta.rating)}
            icon={<StarIcon className="h-5 w-5" />}
          />

          <ProfileMetric
            label="Atendimentos"
            value={(terapeuta.appointments ?? 0).toLocaleString(
              "pt-BR"
            )}
            icon={<CalendarIcon className="h-5 w-5" />}
          />

          <ProfileMetric
            label="Visualizações"
            value={(terapeuta.views ?? 0).toLocaleString("pt-BR")}
            icon={<EyeIcon className="h-5 w-5" />}
          />

          <ProfileMetric
            label="Mensagens"
            value={(terapeuta.messages ?? 0).toLocaleString("pt-BR")}
            icon={<MessageIcon className="h-5 w-5" />}
          />
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* COLUNA PRINCIPAL */}
        <div className="space-y-7">
          {/* DECISÃO ADMINISTRATIVA */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  Análise administrativa
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  Decisão do cadastro
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                  Revise as informações profissionais antes de aprovar ou
                  reprovar este cadastro.
                </p>
              </div>

              <ApprovalBadge
                status={terapeuta.approval_status}
              />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={aprovarTerapeuta}
                disabled={
                  acaoEmAndamento !== null ||
                  statusAprovacao === "aprovado"
                }
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircleIcon className="h-5 w-5" />

                {acaoEmAndamento === "aprovar"
                  ? "Aprovando..."
                  : statusAprovacao === "aprovado"
                    ? "Cadastro aprovado"
                    : "Aprovar terapeuta"}
              </button>

              <button
                type="button"
                onClick={reprovarTerapeuta}
                disabled={
                  acaoEmAndamento !== null ||
                  statusAprovacao === "reprovado"
                }
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm font-bold text-red-300 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloseCircleIcon className="h-5 w-5" />

                {acaoEmAndamento === "reprovar"
                  ? "Reprovando..."
                  : statusAprovacao === "reprovado"
                    ? "Cadastro reprovado"
                    : "Reprovar cadastro"}
              </button>
            </div>

            {terapeuta.reviewed_at && (
              <p className="mt-5 text-xs text-slate-500">
                Última análise registrada em{" "}
                <strong className="font-semibold text-slate-300">
                  {formatarDataHora(terapeuta.reviewed_at)}
                </strong>
              </p>
            )}
          </section>

          {/* APRESENTAÇÃO */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-7">
            <SectionTitle
              eyebrow="Perfil profissional"
              title="Apresentação"
            />

            <div className="mt-6 space-y-6">
              <InfoBlock
                label="Título profissional"
                value={
                  terapeuta.professional_headline ||
                  "Não informado"
                }
              />

              <InfoBlock
                label="Especialidade principal"
                value={terapeuta.speciality || "Não informada"}
              />

              <InfoBlock
                label="Biografia"
                value={terapeuta.bio || "Biografia não informada."}
                multiline
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <InfoBlock
                  label="Experiência"
                  value={terapeuta.experience || "Não informada"}
                />

                <InfoBlock
                  label="Duração da consulta"
                  value={terapeuta.duration || "Não informada"}
                />
              </div>
            </div>
          </section>

          {/* FORMAÇÃO */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-7">
            <SectionTitle
              eyebrow="Qualificação"
              title="Formação profissional"
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoBlock
                label="Formação principal"
                value={terapeuta.main_education || "Não informada"}
              />

              <InfoBlock
                label="Instituição"
                value={
                  terapeuta.education_institution || "Não informada"
                }
              />

              <InfoBlock
                label="Ano de conclusão"
                value={
                  terapeuta.education_year
                    ? String(terapeuta.education_year)
                    : "Não informado"
                }
              />

              <InfoBlock
                label="Modalidade de atendimento"
                value={
                  terapeuta.service_type || "Não informada"
                }
              />
            </div>
          </section>

          {/* OBSERVAÇÕES */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-7">
            <SectionTitle
              eyebrow="Uso interno"
              title="Observações administrativas"
            />

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Este conteúdo é interno e não aparece no perfil público do
              terapeuta.
            </p>

            <textarea
              value={observacoes}
              onChange={(event) =>
                setObservacoes(event.target.value)
              }
              rows={6}
              placeholder="Registre observações sobre documentos, contato, pendências ou decisões administrativas..."
              className="mt-6 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/10"
            />

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={salvarObservacoes}
                disabled={acaoEmAndamento !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-60"
              >
                <SaveIcon className="h-4 w-4" />

                {acaoEmAndamento === "salvar-observacoes"
                  ? "Salvando..."
                  : "Salvar observações"}
              </button>
            </div>
          </section>
        </div>

        {/* COLUNA LATERAL */}
        <aside className="space-y-7">
          {/* CONTATO */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <SectionTitle
              eyebrow="Informações"
              title="Contato"
              compact
            />

            <div className="mt-6 space-y-5">
              <ContactItem
                icon={<MailIcon className="h-5 w-5" />}
                label="E-mail"
                value={terapeuta.email || "Não informado"}
                href={
                  terapeuta.email
                    ? `mailto:${terapeuta.email}`
                    : undefined
                }
              />

              <ContactItem
                icon={<PhoneIcon className="h-5 w-5" />}
                label="Telefone"
                value={terapeuta.phone || "Não informado"}
                href={
                  terapeuta.phone
                    ? `tel:${terapeuta.phone}`
                    : undefined
                }
              />

              <ContactItem
                icon={<MapPinIcon className="h-5 w-5" />}
                label="Localização"
                value={formatarLocal(
                  terapeuta.city,
                  terapeuta.state
                )}
              />

              <ContactItem
                icon={<InstagramIcon className="h-5 w-5" />}
                label="Instagram"
                value={terapeuta.instagram || "Não informado"}
                href={normalizarLinkInstagram(
                  terapeuta.instagram
                )}
              />

              <ContactItem
                icon={<GlobeIcon className="h-5 w-5" />}
                label="Website"
                value={terapeuta.website || "Não informado"}
                href={normalizarUrl(terapeuta.website)}
              />
            </div>
          </section>

          {/* COMERCIAL */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <SectionTitle
              eyebrow="Plano e valores"
              title="Informações comerciais"
              compact
            />

            <div className="mt-6 space-y-5">
              <SideInfo
                label="Plano"
                value={terapeuta.plan || "Free"}
              />

              <SideInfo
                label="Status do plano"
                value={terapeuta.plan_status || "Não informado"}
              />

              <SideInfo
                label="Valor da consulta"
                value={formatarMoeda(terapeuta.price)}
              />

              <SideInfo
                label="Entrada no grupo WhatsApp"
                value={
                  terapeuta.whatsapp_group_joined
                    ? "Confirmada"
                    : "Não confirmada"
                }
              />

              <SideInfo
                label="Cadastro realizado"
                value={formatarDataHora(terapeuta.created_at)}
              />
            </div>
          </section>

          {/* MÍDIA */}
          <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <SectionTitle
              eyebrow="Conteúdo"
              title="Mídia profissional"
              compact
            />

            <div className="mt-6 space-y-4">
              {terapeuta.presentation_video_url ? (
                <a
                  href={terapeuta.presentation_video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 transition hover:border-amber-300/30 hover:bg-amber-300/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                      <VideoIcon className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Vídeo de apresentação
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Abrir em nova guia
                      </p>
                    </div>
                  </div>

                  <ExternalLinkIcon className="h-4 w-4 text-slate-500" />
                </a>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center">
                  <VideoIcon className="mx-auto h-7 w-7 text-slate-600" />

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    Vídeo não informado
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-amber-300">
        {eyebrow}
      </p>

      <h2
        className={`mt-1 font-bold text-white ${
          compact ? "text-xl" : "text-2xl"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

function ProfileMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300">
        {icon}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-1 text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>

      <p
        className={`mt-2 text-sm text-slate-300 ${
          multiline
            ? "whitespace-pre-line leading-7"
            : "leading-6"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-300">
          {value}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className="flex items-start gap-3 transition hover:text-amber-300"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-start gap-3">{content}</div>;
}

function SideInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="max-w-[180px] text-right text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function ApprovalBadge({ status }: { status: string | null }) {
  const normalizado = normalizarStatusAprovacao(status);

  const estilos = {
    aprovado:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    reprovado:
      "border-red-400/20 bg-red-400/10 text-red-300",
    pendente:
      "border-amber-300/20 bg-amber-300/10 text-amber-300",
  };

  const rotulos = {
    aprovado: "Aprovado",
    reprovado: "Reprovado",
    pendente: "Pendente",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${estilos[normalizado]}`}
    >
      {rotulos[normalizado]}
    </span>
  );
}

function PlanBadge({ plano }: { plano: string | null }) {
  const planoNormalizado = (plano || "Free").toLowerCase();
  const premium =
    planoNormalizado === "premium" ||
    planoNormalizado === "destaque";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        premium
          ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
          : "border-slate-400/20 bg-slate-400/10 text-slate-300"
      }`}
    >
      {plano || "Free"}
    </span>
  );
}

function normalizarStatusAprovacao(
  status: string | null
): "pendente" | "aprovado" | "reprovado" {
  const normalizado = (status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (
    normalizado === "aprovado" ||
    normalizado === "approved"
  ) {
    return "aprovado";
  }

  if (
    normalizado === "reprovado" ||
    normalizado === "rejected" ||
    normalizado === "recusado"
  ) {
    return "reprovado";
  }

  return "pendente";
}

function formatarDataHora(data: string | null) {
  if (!data) {
    return "Não informada";
  }

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(valor);
}

function formatarAvaliacao(valor: number | null) {
  return Number(valor ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function formatarMoeda(valor: number | string | null) {
  const numero = Number(valor ?? 0);

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarLocal(
  cidade: string | null,
  estado: string | null
) {
  if (cidade && estado) {
    return `${cidade} - ${estado}`;
  }

  return cidade || estado || "Não informada";
}

function obterIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

function normalizarUrl(valor: string | null) {
  if (!valor) {
    return undefined;
  }

  if (/^https?:\/\//i.test(valor)) {
    return valor;
  }

  return `https://${valor}`;
}

function normalizarLinkInstagram(valor: string | null) {
  if (!valor) {
    return undefined;
  }

  if (/^https?:\/\//i.test(valor)) {
    return valor;
  }

  const usuario = valor.replace(/^@/, "").trim();

  return `https://instagram.com/${usuario}`;
}

type IconProps = {
  className?: string;
};

function ArrowLeftIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 12H5M10 17l-5-5 5-5" />
    </svg>
  );
}

function WarningIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3 2.8 19h18.4L12 3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function CheckCircleIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </svg>
  );
}

function CloseCircleIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </svg>
  );
}

function ExternalLinkIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function PauseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 5v14M15 5v14" />
    </svg>
  );
}

function PlayIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="m8 5 11 7-11 7V5Z" />
    </svg>
  );
}

function StarIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

function CalendarIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function EyeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.5 12s3.7-6 9.5-6 9.5 6 9.5 6-3.7 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

function MessageIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function SaveIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 3h11l3 3v15H5V3Z" />
      <path d="M8 3v6h8V3M8 21v-7h8v7" />
    </svg>
  );
}

function MailIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.5 3.5 9 8l-2 2c1.5 3 3.5 5 6.5 6.5l2-2 4.5 2.5c.4.2.6.6.5 1-1 3-3 4-5.5 3.5C8 20 4 16 2.5 9.5 2 7 3 5 6 4c.2-.1.4-.1.5-.5Z" />
    </svg>
  );
}

function MapPinIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
    </svg>
  );
}

function VideoIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="14" height="14" rx="2" />
      <path d="m17 10 4-2v8l-4-2v-4Z" />
    </svg>
  );
}

function VerifiedIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="m12 2 2.3 2.2 3.2-.5.8 3.1 2.9 1.5-1.4 2.9 1.4 2.9-2.9 1.5-.8 3.1-3.2-.5L12 22l-2.3-2.2-3.2.5-.8-3.1-2.9-1.5 1.4-2.9-1.4-2.9 2.9-1.5.8-3.1 3.2.5L12 2Zm-1.1 13.2 5.7-5.7-1.4-1.4-4.3 4.3-2.1-2.1-1.4 1.4 3.5 3.5Z" />
    </svg>
  );
}