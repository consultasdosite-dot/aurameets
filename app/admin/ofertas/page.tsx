"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type TerapeutaRelacionado = {
  id: number;
  name: string;
  speciality: string | null;
  photo_url: string | null;
  profile_photo_url: string | null;
};

type Oferta = {
  id: number;
  created_at: string | null;
  therapist_id: number | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  offer_type: string | null;
  original_price: number | string | null;
  offer_price: number | string | null;
  available_slots: number | null;
  claimed_slots: number | null;
  duration: string | null;
  service_type: string | null;
  city: string | null;
  valid_until: string | null;
  active: boolean | null;
  featured: boolean | null;
  terms: string | null;
  therapist: TerapeutaRelacionado | null;
};

type OfertaSupabase = Omit<Oferta, "therapist"> & {
  therapist:
    | TerapeutaRelacionado
    | TerapeutaRelacionado[]
    | null;
};

type FiltroStatus = "todas" | "ativas" | "inativas";
type FiltroDestaque = "todas" | "destaques" | "comuns";

type AcaoEmAndamento = {
  ofertaId: number;
  tipo: "active" | "featured";
} | null;

export default function AdminOfertasPage() {
  const router = useRouter();

  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("todas");
  const [filtroDestaque, setFiltroDestaque] =
    useState<FiltroDestaque>("todas");

  const [acaoEmAndamento, setAcaoEmAndamento] =
    useState<AcaoEmAndamento>(null);

  useEffect(() => {
    carregarOfertas();
  }, []);

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
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (erroPerfil || !perfil || perfil.user_type !== "admin") {
      router.replace("/");
      return null;
    }

    return user;
  }

  async function carregarOfertas() {
    setLoading(true);
    setErro("");
    setMensagem("");

    try {
      const administrador = await verificarAdministrador();

      if (!administrador) {
        return;
      }

      const { data, error } = await supabase
        .from("offers")
        .select(
          `
            id,
            created_at,
            therapist_id,
            title,
            subtitle,
            description,
            image_url,
            offer_type,
            original_price,
            offer_price,
            available_slots,
            claimed_slots,
            duration,
            service_type,
            city,
            valid_until,
            active,
            featured,
            terms,
            therapist:therapists (
              id,
              name,
              speciality,
              photo_url,
              profile_photo_url
            )
          `
        )
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const ofertasNormalizadas = (
        (data ?? []) as unknown as OfertaSupabase[]
      ).map((oferta) => ({
        ...oferta,
        therapist: Array.isArray(oferta.therapist)
          ? oferta.therapist[0] ?? null
          : oferta.therapist,
      }));

      setOfertas(ofertasNormalizadas);
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);

      setErro(
        "Não foi possível carregar as ofertas. Verifique as políticas RLS da tabela offers."
      );
    } finally {
      setLoading(false);
    }
  }

  async function alternarStatus(oferta: Oferta) {
    const novoStatus = oferta.active === false;

    const confirmou = window.confirm(
      novoStatus
        ? `Deseja ativar a oferta “${oferta.title}”?`
        : `Deseja desativar a oferta “${oferta.title}”?`
    );

    if (!confirmou) {
      return;
    }

    await atualizarCampoBooleano(
      oferta,
      "active",
      novoStatus,
      novoStatus
        ? "A oferta foi ativada."
        : "A oferta foi desativada."
    );
  }

  async function alternarDestaque(oferta: Oferta) {
    const novoDestaque = oferta.featured !== true;

    const confirmou = window.confirm(
      novoDestaque
        ? `Deseja destacar “${oferta.title}” na Home?`
        : `Deseja remover “${oferta.title}” dos destaques da Home?`
    );

    if (!confirmou) {
      return;
    }

    await atualizarCampoBooleano(
      oferta,
      "featured",
      novoDestaque,
      novoDestaque
        ? "A oferta foi marcada como destaque."
        : "A oferta foi removida dos destaques."
    );
  }

  async function atualizarCampoBooleano(
    oferta: Oferta,
    campo: "active" | "featured",
    valor: boolean,
    mensagemSucesso: string
  ) {
    setAcaoEmAndamento({
      ofertaId: oferta.id,
      tipo: campo,
    });

    setErro("");
    setMensagem("");

    try {
      const administrador = await verificarAdministrador();

      if (!administrador) {
        return;
      }

      const { error } = await supabase
        .from("offers")
        .update({
          [campo]: valor,
        })
        .eq("id", oferta.id);

      if (error) {
        throw error;
      }

      setOfertas((listaAtual) =>
        listaAtual.map((item) =>
          item.id === oferta.id
            ? {
                ...item,
                [campo]: valor,
              }
            : item
        )
      );

      setMensagem(mensagemSucesso);
    } catch (error) {
      console.error("Erro ao atualizar oferta:", error);

      setErro(
        "A alteração não pôde ser salva. Verifique a política RLS de atualização da tabela offers."
      );
    } finally {
      setAcaoEmAndamento(null);
    }
  }

  const ofertasFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca);

    return ofertas.filter((oferta) => {
      const correspondeBusca =
        termo.length === 0 ||
        [
          oferta.title,
          oferta.subtitle,
          oferta.description,
          oferta.offer_type,
          oferta.city,
          oferta.service_type,
          oferta.therapist?.name,
          oferta.therapist?.speciality,
        ].some((valor) => normalizarTexto(valor).includes(termo));

      const correspondeStatus =
        filtroStatus === "todas" ||
        (filtroStatus === "ativas" && oferta.active !== false) ||
        (filtroStatus === "inativas" && oferta.active === false);

      const correspondeDestaque =
        filtroDestaque === "todas" ||
        (filtroDestaque === "destaques" &&
          oferta.featured === true) ||
        (filtroDestaque === "comuns" &&
          oferta.featured !== true);

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondeDestaque
      );
    });
  }, [ofertas, busca, filtroStatus, filtroDestaque]);

  const indicadores = useMemo(() => {
    return {
      total: ofertas.length,
      ativas: ofertas.filter((oferta) => oferta.active !== false)
        .length,
      destaques: ofertas.filter(
        (oferta) => oferta.featured === true
      ).length,
      vagasRestantes: ofertas.reduce(
        (total, oferta) => total + calcularVagasRestantes(oferta),
        0
      ),
    };
  }, [ofertas]);

  function limparFiltros() {
    setBusca("");
    setFiltroStatus("todas");
    setFiltroDestaque("todas");
  }

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-amber-300" />

          <p className="mt-5 text-sm font-medium text-slate-400">
            Carregando ofertas...
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Experiências AuraMeets
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ofertas especiais
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            Gerencie sessões gratuitas, descontos e experiências
            oferecidas pelos terapeutas da plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={carregarOfertas}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <RefreshIcon className="h-4 w-4" />
            Atualizar lista
          </button>

          <button
            type="button"
            disabled
            title="O formulário será criado na próxima etapa."
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 opacity-60"
          >
            <PlusIcon className="h-4 w-4" />
            Nova oferta
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndicatorCard
          titulo="Total"
          valor={indicadores.total}
          descricao="Ofertas cadastradas"
          icon={<GiftIcon className="h-5 w-5" />}
        />

        <IndicatorCard
          titulo="Ativas"
          valor={indicadores.ativas}
          descricao="Disponíveis ao público"
          icon={<ActivityIcon className="h-5 w-5" />}
        />

        <IndicatorCard
          titulo="Destaques"
          valor={indicadores.destaques}
          descricao="Selecionadas para a Home"
          icon={<StarIcon className="h-5 w-5" />}
        />

        <IndicatorCard
          titulo="Vagas restantes"
          valor={indicadores.vagasRestantes}
          descricao="Somatório das vagas disponíveis"
          icon={<UsersIcon className="h-5 w-5" />}
        />
      </section>

      {mensagem && (
        <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

            <div>
              <p className="font-semibold text-emerald-200">
                Alteração concluída
              </p>

              <p className="mt-1 text-sm text-emerald-200/70">
                {mensagem}
              </p>
            </div>
          </div>
        </section>
      )}

      {erro && (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <WarningIcon className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div>
              <p className="font-semibold text-red-200">
                Não foi possível concluir
              </p>

              <p className="mt-1 text-sm text-red-200/70">
                {erro}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1fr)_220px_220px_auto]">
          <label className="relative block">
            <span className="sr-only">Pesquisar ofertas</span>

            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquisar oferta, terapeuta ou especialidade..."
              className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-300/50 focus:ring-4 focus:ring-amber-300/10"
            />
          </label>

          <select
            value={filtroStatus}
            onChange={(event) =>
              setFiltroStatus(event.target.value as FiltroStatus)
            }
            className="h-12 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none"
          >
            <option value="todas">Todos os status</option>
            <option value="ativas">Somente ativas</option>
            <option value="inativas">Somente inativas</option>
          </select>

          <select
            value={filtroDestaque}
            onChange={(event) =>
              setFiltroDestaque(
                event.target.value as FiltroDestaque
              )
            }
            className="h-12 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-300 outline-none"
          >
            <option value="todas">Todos os destaques</option>
            <option value="destaques">Destaques da Home</option>
            <option value="comuns">Ofertas comuns</option>
          </select>

          <button
            type="button"
            onClick={limparFiltros}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <CloseIcon className="h-4 w-4" />
            Limpar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-white">
              Lista de ofertas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {ofertasFiltradas.length.toLocaleString("pt-BR")}{" "}
              {ofertasFiltradas.length === 1
                ? "resultado encontrado"
                : "resultados encontrados"}
            </p>
          </div>
        </div>

        {ofertasFiltradas.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-600">
              <GiftIcon className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Nenhuma oferta encontrada
            </h3>
          </div>
        ) : (
          <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-2">
            {ofertasFiltradas.map((oferta) => (
              <OfertaCard
                key={oferta.id}
                oferta={oferta}
                acaoEmAndamento={acaoEmAndamento}
                onAlternarStatus={() => alternarStatus(oferta)}
                onAlternarDestaque={() =>
                  alternarDestaque(oferta)
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OfertaCard({
  oferta,
  acaoEmAndamento,
  onAlternarStatus,
  onAlternarDestaque,
}: {
  oferta: Oferta;
  acaoEmAndamento: AcaoEmAndamento;
  onAlternarStatus: () => void;
  onAlternarDestaque: () => void;
}) {
  const estaAtiva = oferta.active !== false;
  const estaDestacada = oferta.featured === true;
  const vagasRestantes = calcularVagasRestantes(oferta);
  const foto =
    oferta.image_url ||
    oferta.therapist?.profile_photo_url ||
    oferta.therapist?.photo_url ||
    null;

  const carregandoStatus =
    acaoEmAndamento?.ofertaId === oferta.id &&
    acaoEmAndamento.tipo === "active";

  const carregandoDestaque =
    acaoEmAndamento?.ofertaId === oferta.id &&
    acaoEmAndamento.tipo === "featured";

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/45">
      <div className="grid sm:grid-cols-[165px_1fr]">
        <div className="relative flex min-h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-violet-700 to-amber-400">
          {foto ? (
            <img
              src={foto}
              alt={`Imagem da oferta ${oferta.title}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl font-black text-white backdrop-blur">
              {obterIniciais(oferta.therapist?.name || "AuraMeets")}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/70">
              Terapeuta
            </p>

            <p className="mt-1 font-bold text-white">
              {oferta.therapist?.name || "Não vinculado"}
            </p>
          </div>
        </div>

        <div className="flex flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge active={estaAtiva} />

              {estaDestacada && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-300">
                  <StarIcon className="h-3.5 w-3.5" />
                  Destaque
                </span>
              )}
            </div>

            <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold capitalize text-violet-300">
              {oferta.offer_type || "gratuita"}
            </span>
          </div>

          <h3 className="mt-5 text-xl font-bold leading-tight text-white">
            {oferta.title}
          </h3>

          {oferta.subtitle && (
            <p className="mt-2 text-sm font-medium text-amber-300">
              {oferta.subtitle}
            </p>
          )}

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
            {oferta.description || "Descrição não informada."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoItem
              label="Vagas restantes"
              value={vagasRestantes.toLocaleString("pt-BR")}
            />

            <InfoItem
              label="Utilizadas"
              value={(oferta.claimed_slots ?? 0).toLocaleString(
                "pt-BR"
              )}
            />

            <InfoItem
              label="Duração"
              value={oferta.duration || "Não informada"}
            />

            <InfoItem
              label="Modalidade"
              value={oferta.service_type || "Não informada"}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600">
                  Valor da oferta
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-300">
                  {formatarMoeda(oferta.offer_price)}
                </p>
              </div>

              {Number(oferta.original_price ?? 0) > 0 && (
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-600">
                    Valor original
                  </p>

                  <p className="mt-1 text-sm text-slate-500 line-through">
                    {formatarMoeda(oferta.original_price)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>
              Validade: {formatarData(oferta.valid_until)}
            </span>

            <span>
              Criada em: {formatarData(oferta.created_at)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onAlternarDestaque}
              disabled={
                carregandoDestaque || acaoEmAndamento !== null
              }
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                estaDestacada
                  ? "border-amber-300/20 bg-amber-300/10 text-amber-300 hover:bg-amber-300/15"
                  : "border-white/10 text-slate-300 hover:bg-white/[0.05]"
              }`}
            >
              <StarIcon className="h-4 w-4" />

              {carregandoDestaque
                ? "Salvando..."
                : estaDestacada
                  ? "Remover destaque"
                  : "Destacar na Home"}
            </button>

            <button
              type="button"
              onClick={onAlternarStatus}
              disabled={carregandoStatus || acaoEmAndamento !== null}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition disabled:cursor-wait disabled:opacity-50 ${
                estaAtiva
                  ? "border border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/15"
                  : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
              }`}
            >
              {estaAtiva ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}

              {carregandoStatus
                ? "Salvando..."
                : estaAtiva
                  ? "Desativar oferta"
                  : "Ativar oferta"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function IndicatorCard({
  titulo,
  valor,
  descricao,
  icon,
}: {
  titulo: string;
  valor: number;
  descricao: string;
  icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {titulo}
          </p>

          <p className="mt-2 text-3xl font-bold text-white">
            {valor.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300">
          {icon}
        </div>
      </div>

      <p className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-500">
        {descricao}
      </p>
    </article>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-300">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
        active
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-slate-500/20 bg-slate-500/10 text-slate-400"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-emerald-300" : "bg-slate-500"
        }`}
      />

      {active ? "Ativa" : "Inativa"}
    </span>
  );
}

function calcularVagasRestantes(oferta: Oferta) {
  const total = Math.max(0, oferta.available_slots ?? 0);
  const utilizadas = Math.max(0, oferta.claimed_slots ?? 0);

  return Math.max(0, total - utilizadas);
}

function normalizarTexto(valor: string | null | undefined) {
  return (valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function formatarData(data: string | null) {
  if (!data) {
    return "Não informada";
  }

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat("pt-BR").format(valor);
}

function obterIniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return "AM";
  }

  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

type IconProps = {
  className?: string;
};

function RefreshIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6.1 8a7 7 0 0 1 11.4-2.2L20 8M4 16l2.5 2.2A7 7 0 0 0 17.9 16" />
    </svg>
  );
}

function PlusIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function GiftIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="9" width="18" height="12" rx="2" />
      <path d="M12 9v12M3 13h18M5 9h14" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9ZM12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </svg>
  );
}

function ActivityIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 12h4l2-5 4 10 2-5h6" />
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

function UsersIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M15 15a5 5 0 0 1 6 5" />
    </svg>
  );
}

function SearchIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CloseIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6l-12 12" />
    </svg>
  );
}

function CheckIcon({ className = "" }: IconProps) {
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