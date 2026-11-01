"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTherapistIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type Reserva = {
  id: number;
  therapist_id: number;
  data_divulgacao: string;
};

const LIMITE_DIA = 3;
const LIMITE_SEMANA = 2;

function dataLocal(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function inicioSemana(data: string): string {
  const [ano, mes, dia] = data.split("-").map(Number);
  const date = new Date(ano, mes - 1, dia);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return dataLocal(date);
}

function formatarData(data: string): string {
  return data.split("-").reverse().join("/");
}

function mensagemErro(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

export default function AgendaPage() {
  const router = useRouter();
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [terapeutaId, setTerapeutaId] = useState<number | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const carregarAgenda = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) {
        setTerapeutaId(null);
        router.replace("/login-terapeuta");
        return;
      }

      const id = await getTherapistIdByProfileId(authData.user.id);
      if (id == null) {
        setTerapeutaId(null);
        setErro("Não foi possível identificar seu perfil de terapeuta.");
        return;
      }
      const idNumerico = Number(id);
      if (!Number.isFinite(idNumerico)) {
        throw new Error("Identificador do terapeuta inválido.");
      }
      setTerapeutaId(idNumerico);

      const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
      const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
      const inicio = new Date(primeiroDia);
      inicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7));
      const fim = new Date(ultimoDia);
      fim.setDate(fim.getDate() + (6 - ((fim.getDay() + 6) % 7)));

      const { data, error } = await supabase
        .from("agenda_divulgacao")
        .select("id, therapist_id, data_divulgacao")
        .gte("data_divulgacao", dataLocal(inicio))
        .lte("data_divulgacao", dataLocal(fim))
        .order("data_divulgacao", { ascending: true });
      if (error) throw error;
      setReservas((data ?? []) as Reserva[]);
    } catch (errorDesconhecido) {
      setErro(mensagemErro(errorDesconhecido));
    } finally {
      setCarregando(false);
    }
  }, [mesAtual, router]);

  useEffect(() => {
    void carregarAgenda();
  }, [carregarAgenda]);

  const dias = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();
    const deslocamento = (new Date(ano, mes, 1).getDay() + 6) % 7;
    const quantidade = new Date(ano, mes + 1, 0).getDate();
    return [
      ...Array.from({ length: deslocamento }, () => null),
      ...Array.from({ length: quantidade }, (_, i) => dataLocal(new Date(ano, mes, i + 1))),
    ];
  }, [mesAtual]);

  const hoje = dataLocal(new Date());
  const minhasReservas = reservas
    .filter((reserva) => reserva.therapist_id === terapeutaId && reserva.data_divulgacao >= hoje)
    .sort((a, b) => a.data_divulgacao.localeCompare(b.data_divulgacao));

  async function alterarReserva(data: string) {
    if (terapeutaId === null || salvando || carregando) return;
    setErro("");
    setAviso("");

    const reservaMinha = reservas.find(
      (reserva) => reserva.data_divulgacao === data && reserva.therapist_id === terapeutaId,
    );
    const ocupadas = reservas.filter((reserva) => reserva.data_divulgacao === data).length;
    const minhaSemana = reservas.filter(
      (reserva) =>
        reserva.therapist_id === terapeutaId &&
        inicioSemana(reserva.data_divulgacao) === inicioSemana(data),
    ).length;

    if (data < hoje) return;
    if (!reservaMinha && ocupadas >= LIMITE_DIA) {
      setErro("As três vagas deste dia já estão ocupadas.");
      return;
    }
    if (!reservaMinha && minhaSemana >= LIMITE_SEMANA) {
      setErro("Você já escolheu dois dias nesta semana.");
      return;
    }

    if (!reservaMinha) {
      const confirmado = window.confirm(
        `Confirmar divulgação em ${formatarData(data)}?\n\n` +
          "Ao participar, seu perfil poderá receber maior visibilidade e pedidos de consultas. " +
          "Mantenha seus serviços e valores atualizados.",
      );
      if (!confirmado) return;
    } else if (!window.confirm("Deseja cancelar sua reserva deste dia?")) {
      return;
    }

    setSalvando(true);
    try {
      if (reservaMinha) {
        const { error } = await supabase
          .from("agenda_divulgacao")
          .delete()
          .eq("id", reservaMinha.id)
          .eq("therapist_id", terapeutaId);
        if (error) throw error;
        setAviso("Reserva cancelada.");
      } else {
        const { error } = await supabase.from("agenda_divulgacao").insert({
          therapist_id: terapeutaId,
          data_divulgacao: data,
        });
        if (error) throw error;
        setAviso("Dia reservado com sucesso.");
      }
      await carregarAgenda();
    } catch (errorDesconhecido) {
      setErro(mensagemErro(errorDesconhecido));
      await carregarAgenda();
    } finally {
      setSalvando(false);
    }
  }

  function mudarMes(diferenca: number) {
    setErro("");
    setAviso("");
    setMesAtual((atual) => new Date(atual.getFullYear(), atual.getMonth() + diferenca, 1));
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xl font-bold tracking-tight text-purple-700">AuraMeets</span>
          <button
            type="button"
            onClick={() => router.push("/dashboard-terapeuta")}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Voltar ao painel
          </button>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Agenda de Divulgação</h1>
          <p className="mt-4 leading-7 text-slate-600">
            Escolha, se desejar, até dois dias por semana para participar da divulgação
            no Instagram oficial do AuraMeets. Há três vagas disponíveis por dia.
          </p>
          <p className="mt-2 leading-7 text-slate-600">
            Toque em uma data disponível para reservar. Para cancelar, toque novamente em “Meu dia”.
          </p>

          <div className="mt-8" aria-label="Calendário mensal de divulgação">
            <div className="mb-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => mudarMes(-1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100"
                aria-label="Mês anterior"
              >
                ←
              </button>
              <h2 className="text-center text-lg font-bold capitalize text-slate-900">
                {mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </h2>
              <button
                type="button"
                onClick={() => mudarMes(1)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-100"
                aria-label="Próximo mês"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-600 sm:gap-2 sm:text-sm">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia) => (
                <span key={dia} className="py-2">{dia}</span>
              ))}
              {dias.map((data, indice) => {
                if (!data) return <span key={`vazio-${indice}`} />;
                const doDia = reservas.filter((reserva) => reserva.data_divulgacao === data);
                const minha = doDia.some((reserva) => reserva.therapist_id === terapeutaId);
                const indisponivel = data < hoje || (!minha && doDia.length >= LIMITE_DIA);
                const minhaSemana = reservas.filter(
                  (reserva) =>
                    reserva.therapist_id === terapeutaId &&
                    inicioSemana(reserva.data_divulgacao) === inicioSemana(data),
                ).length;
                const limiteSemanal = !minha && minhaSemana >= LIMITE_SEMANA;
                const desabilitado = carregando || salvando || terapeutaId === null || indisponivel || limiteSemanal;
                const texto = minha
                  ? "Meu dia"
                  : data < hoje
                    ? "Encerrado"
                    : doDia.length >= LIMITE_DIA
                      ? "Lotado"
                      : limiteSemanal
                        ? "Limite semanal"
                        : `${LIMITE_DIA - doDia.length} vagas`;

                return (
                  <button
                    key={data}
                    type="button"
                    disabled={desabilitado}
                    onClick={() => void alterarReserva(data)}
                    title={minha ? "Cancelar minha reserva" : texto}
                    aria-label={`${formatarData(data)}: ${texto}`}
                    className={`min-h-16 rounded-lg border px-1 py-2 text-center sm:min-h-20 ${
                      minha
                        ? "border-purple-700 bg-purple-100 text-purple-900"
                        : desabilitado
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                          : "border-slate-300 bg-white text-slate-800 hover:border-purple-600"
                    }`}
                  >
                    <span className="block text-sm font-bold">{Number(data.slice(-2))}</span>
                    <span className="mt-1 block text-[10px] leading-tight sm:text-xs">{texto}</span>
                  </button>
                );
              })}
            </div>

            {carregando && <p className="mt-4 text-sm text-slate-600">Carregando agenda...</p>}
            {salvando && <p className="mt-4 text-sm text-slate-600">Salvando reserva...</p>}
            {erro && <p role="alert" className="mt-4 text-sm text-red-700">{erro}</p>}
            {aviso && <p role="status" className="mt-4 text-sm text-green-700">{aviso}</p>}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Meus próximos dias de divulgação</h2>
          {minhasReservas.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Você ainda não tem dias futuros reservados neste período.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {minhasReservas.map((reserva) => (
                <span key={reserva.id} className="rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-900">
                  {formatarData(reserva.data_divulgacao)}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-slate-500">São exibidas as reservas do mês selecionado e das semanas que o atravessam.</p>
        </section>
      </div>
    </main>
  );
}
