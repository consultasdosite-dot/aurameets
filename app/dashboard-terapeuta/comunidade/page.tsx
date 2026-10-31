"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { getTherapistIdByProfileId } from "@/lib/appointments";
import { supabase } from "@/lib/supabase";

type Mensagem = {
  id: number;
  therapist_id: number;
  mensagem: string;
  created_at: string;
};

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
  const diferenca = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - diferenca);
  return dataLocal(date);
}

function mensagemErro(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

export default function ComunidadeTerapeutasPage() {
  const [agendaAberta, setAgendaAberta] = useState(false);
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [respondendoA, setRespondendoA] = useState<Mensagem | null>(null);
  const [erroChat, setErroChat] = useState("");
  const [enviandoChat, setEnviandoChat] = useState(false);
  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();
    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });
  const [terapeutaId, setTerapeutaId] = useState<number | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(false);
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
        setErro("Entre na sua conta de terapeuta para consultar a agenda.");
        return;
      }

      const id = await getTherapistIdByProfileId(authData.user.id);
      if (id == null) {
        setTerapeutaId(null);
        setErro("Não foi possível identificar seu perfil de terapeuta.");
        return;
      }
      const idNumerico = Number(id);
      if (!Number.isFinite(idNumerico)) throw new Error("Identificador do terapeuta inválido.");
      setTerapeutaId(idNumerico);

      // O período inclui semanas que cruzam os limites do mês.
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
    } catch (error) {
      setErro(mensagemErro(error));
    } finally {
      setCarregando(false);
    }
  }, [mesAtual]);

  useEffect(() => {
    if (agendaAberta) void carregarAgenda();
  }, [agendaAberta, carregarAgenda]);

  const carregarChat = useCallback(async () => {
    setErroChat("");
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      setErroChat("Entre na sua conta de terapeuta para participar do chat.");
      return;
    }
    const id = await getTherapistIdByProfileId(authData.user.id);
    if (id == null) {
      setErroChat("Chat exclusivo para terapeutas cadastrados.");
      return;
    }
    setTerapeutaId(Number(id));
    const { data, error } = await supabase
      .from("comunidade_mensagens")
      .select("id, therapist_id, mensagem, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      setErroChat("Chat ainda não configurado. Aguarde a liberação administrativa.");
      return;
    }
    setMensagens((data ?? []) as Mensagem[]);
  }, []);

  useEffect(() => {
    if (!chatAberto) return;
    void carregarChat();
    const canal = supabase
      .channel("comunidade-chat-atualizacoes")
      .on("postgres_changes", { event: "*", schema: "public", table: "comunidade_mensagens" }, () => {
        void carregarChat();
      })
      .subscribe();
    return () => { void supabase.removeChannel(canal); };
  }, [chatAberto, carregarChat]);

  async function enviarMensagem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const texto = novaMensagem.trim();
    const referencia = respondendoA
      ? `↪ Em resposta ao terapeuta #${respondendoA.therapist_id}: ${respondendoA.mensagem.replace(/\s+/g, " ").slice(0, 120)}\n`
      : "";
    const mensagem = referencia + texto;
    if (!texto || mensagem.length > 1000 || enviandoChat || terapeutaId == null) return;
    setEnviandoChat(true);
    setErroChat("");
    const { error } = await supabase.from("comunidade_mensagens").insert({
      therapist_id: terapeutaId,
      mensagem,
    });
    if (error) {
      setErroChat("Não foi possível enviar. Verifique se o chat já foi habilitado.");
    } else {
      setNovaMensagem("");
      setRespondendoA(null);
      await carregarChat();
    }
    setEnviandoChat(false);
  }

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

    if (!reservaMinha && data < hoje) return;
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
        `Confirmar divulgação em ${data.split("-").reverse().join("/")}?\n\n` +
          "Ao participar, seu perfil poderá receber maior visibilidade e pedidos de consultas. " +
          "Mantenha seus serviços, valores e disponibilidade atualizados.",
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
    } catch (error) {
      setErro(mensagemErro(error));
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
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-purple-700">AuraMeets</span>
        </header>

        <div className="overflow-hidden rounded-3xl">
          <img
            src="/aurameets-comunidade.png"
            alt="Mãos se aproximando, representando conexão e acolhimento"
            className="block h-auto w-full object-cover"
          />
        </div>

        <section className="mx-auto max-w-3xl py-10 text-center md:py-14">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            Você não está sozinho.
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">
            No AuraMeets, acreditamos que juntos podemos ir mais longe. Esta comunidade
            foi criada para unir terapeutas, compartilhar experiências, fortalecer
            parcerias e abrir novas oportunidades de crescimento.
          </p>
          <p className="mt-4 text-base leading-8 text-slate-600 md:text-lg">
            Aqui, você tem espaço para trocar ideias, participar das divulgações
            e ampliar sua visibilidade profissional.
          </p>
          <p className="mt-4 text-base font-semibold leading-8 text-slate-800 md:text-lg">
            Porque quem dedica a vida a cuidar de outras pessoas também merece apoio,
            reconhecimento e oportunidades.
          </p>
        </section>

        <div className="mx-auto max-w-4xl">
          <section className="border-b border-slate-200 py-9">
            <h2 className="text-2xl font-bold text-slate-900">Agenda de Divulgação</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Escolha, se desejar, até dois dias por semana para participar da divulgação
              no Instagram oficial do AuraMeets. Há três vagas disponíveis por dia.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              Nos dias escolhidos, seu perfil poderá receber mais visibilidade e pedidos
              de consultas. Mantenha sua agenda e seus serviços atualizados.
            </p>
            <button
              type="button"
              onClick={() => setAgendaAberta((aberta) => !aberta)}
              aria-expanded={agendaAberta}
              className="mt-6 rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800"
            >
              {agendaAberta ? "FECHAR AGENDA" : "ESCOLHER MEUS DIAS"}
            </button>

            {agendaAberta && (
              <div className="mt-8" aria-label="Calendário mensal de divulgação">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => mudarMes(-1)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700"
                    aria-label="Mês anterior"
                  >
                    ←
                  </button>
                  <h3 className="text-center text-lg font-bold capitalize text-slate-900">
                    {mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => mudarMes(1)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700"
                    aria-label="Próximo mês"
                  >
                    →
                  </button>
                </div>
                <p className="mb-4 text-sm text-slate-600">
                  Selecione um dia para reservar. Dias marcados como “Meu dia” podem ser
                  selecionados novamente para cancelar a reserva.
                </p>
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
                    return (
                      <button
                        key={data}
                        type="button"
                        disabled={carregando || salvando || terapeutaId === null || indisponivel || limiteSemanal}
                        onClick={() => void alterarReserva(data)}
                        title={minha ? "Cancelar minha reserva" : `${LIMITE_DIA - doDia.length} vagas disponíveis`}
                        aria-label={`${data.split("-").reverse().join("/")}: ${minha ? "meu dia reservado" : `${LIMITE_DIA - doDia.length} vagas disponíveis`}`}
                        className={`min-h-16 rounded-lg border px-1 py-2 text-center sm:min-h-20 ${
                          minha
                            ? "border-purple-700 bg-purple-100 text-purple-900"
                            : indisponivel || limiteSemanal
                              ? "cursor-not-allowed border-slate-200 text-slate-400"
                              : "border-slate-300 bg-white text-slate-800 hover:border-purple-600"
                        }`}
                      >
                        <span className="block text-sm font-bold">{Number(data.slice(-2))}</span>
                        <span className="mt-1 block text-[10px] leading-tight sm:text-xs">
                          {minha ? "Meu dia" : indisponivel && data >= hoje ? "Lotado" : `${LIMITE_DIA - doDia.length} vagas`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {carregando && <p className="mt-4 text-sm text-slate-600">Carregando agenda...</p>}
                {salvando && <p className="mt-4 text-sm text-slate-600">Salvando reserva...</p>}
                {erro && <p role="alert" className="mt-4 text-sm text-red-700">{erro}</p>}
                {aviso && <p role="status" className="mt-4 text-sm text-green-700">{aviso}</p>}
              </div>
            )}
          </section>

          <section className="py-9">
            <h2 className="text-2xl font-bold text-slate-900">Mensagens da Comunidade</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Converse com outros terapeutas, compartilhe experiências e acompanhe comunicados.
            </p>
            <button
              type="button"
              onClick={() => setChatAberto((aberto) => !aberto)}
              aria-expanded={chatAberto}
              className="mt-6 rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white hover:bg-purple-800"
            >
              {chatAberto ? "FECHAR CHAT" : "ABRIR CHAT"}
            </button>
            {chatAberto && (
              <div className="mt-7 border-t border-slate-200 pt-5">
                <p className="mb-4 text-sm text-slate-600">
                  Espaço exclusivo para terapeutas. Respeite os colegas e não compartilhe dados de clientes.
                </p>
                <div aria-label="Mensagens do chat" aria-live="polite" className="max-h-96 space-y-4 overflow-y-auto py-3">
                  {mensagens.length === 0 && !erroChat && (
                    <p className="text-sm text-slate-500">Ainda não há mensagens.</p>
                  )}
                  {mensagens.map((mensagem) => (
                    <div key={mensagem.id} className="border-b border-slate-100 pb-3">
                      <p className="text-xs font-semibold text-purple-700">
                        {mensagem.therapist_id === terapeutaId ? "Você" : `Terapeuta #${mensagem.therapist_id}`}
                        {" · "}
                        {new Date(mensagem.created_at).toLocaleString("pt-BR")}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-slate-800">{mensagem.mensagem}</p>
                      <button
                        type="button"
                        onClick={() => setRespondendoA(mensagem)}
                        className="mt-3 inline-flex rounded-lg bg-purple-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
                      >
                        RESPONDER
                      </button>
                    </div>
                  ))}
                </div>
                {erroChat && <p role="alert" className="my-3 text-sm text-red-700">{erroChat}</p>}
                {respondendoA && (
                  <div className="mt-4 flex items-start justify-between gap-3 border-l-2 border-purple-700 pl-3 text-sm text-slate-700">
                    <p className="min-w-0 break-words">
                      Respondendo ao terapeuta #{respondendoA.therapist_id}: {respondendoA.mensagem.slice(0, 120)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setRespondendoA(null)}
                      className="shrink-0 font-semibold text-purple-700"
                      aria-label="Cancelar resposta"
                    >
                      CANCELAR
                    </button>
                  </div>
                )}
                <form onSubmit={(event) => void enviarMensagem(event)} className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="mensagem-comunidade" className="sr-only">Sua mensagem</label>
                  <input
                    id="mensagem-comunidade"
                    value={novaMensagem}
                    onChange={(event) => setNovaMensagem(event.target.value)}
                    maxLength={respondendoA ? Math.max(1, 1000 - (`↪ Em resposta ao terapeuta #${respondendoA.therapist_id}: ${respondendoA.mensagem.replace(/\s+/g, " ").slice(0, 120)}\n`).length) : 1000}
                    placeholder="Escreva sua mensagem..."
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={!novaMensagem.trim() || enviandoChat || terapeutaId == null || Boolean(erroChat) || (respondendoA ? (`↪ Em resposta ao terapeuta #${respondendoA.therapist_id}: ${respondendoA.mensagem.replace(/\s+/g, " ").slice(0, 120)}\n`).length + novaMensagem.trim().length > 1000 : false)}
                    className="rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    {enviandoChat ? "ENVIANDO..." : "ENVIAR"}
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
