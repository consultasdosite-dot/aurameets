"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "aurameets-guia-terapeuta-v1";

const etapas = [
  {
    titulo: "Complete seu perfil",
    descricao: "Adicione uma foto profissional, conte um pouco sobre sua trajetória e explique como você pode ajudar seus clientes.",
    dica: "Use palavras simples e uma foto nítida. Uma boa apresentação transmite confiança.",
    href: "/dashboard-terapeuta/perfil",
    botao: "Abrir Meu Perfil",
  },
  {
    titulo: "Selecione suas especialidades",
    descricao: "Escolha as terapias e as áreas em que você atua para ajudar os visitantes a encontrar seu trabalho.",
    dica: "Selecione apenas as especialidades que você realmente oferece.",
    href: "/dashboard-terapeuta/especialidades",
    botao: "Abrir Especialidades",
  },
  {
    titulo: "Cadastre seus serviços",
    descricao: "Informe o nome de cada atendimento, o que está incluído, a duração, a modalidade e o preço. Cadastre pacotes, se oferecer.",
    dica: "Comece pelo seu principal serviço. Depois, acrescente os demais.",
    href: "/dashboard-terapeuta/servicos",
    botao: "Cadastrar Serviços",
  },
  {
    titulo: "Configure seu Presente",
    descricao: "Crie uma Experiência Presente gratuita para que novos clientes conheçam seu trabalho. Explique claramente o que será oferecido e as condições.",
    dica: "O Presente é diferente de um serviço pago ou de uma promoção.",
    href: "/dashboard-terapeuta/experiencias",
    botao: "Configurar Presente",
  },
  {
    titulo: "Crie um Desconto",
    descricao: "Prepare uma oferta promocional, informando o serviço, o preço original, o valor com desconto e as condições da promoção.",
    dica: "Deixe claro o benefício e, quando houver, o prazo de validade.",
    href: "/dashboard-terapeuta/promocao",
    botao: "Criar Desconto",
  },
  {
    titulo: "Organize sua agenda",
    descricao: "Confira seus horários disponíveis para receber solicitações de atendimento e evitar conflitos de agenda.",
    dica: "Revise sua disponibilidade sempre que houver alguma mudança.",
    href: "/agenda",
    botao: "Abrir Agenda",
  },
  {
    titulo: "Acompanhe as solicitações",
    descricao: "Consulte os pedidos recebidos, responda aos clientes e confirme os atendimentos ou proponha outro horário quando necessário.",
    dica: "Responder rapidamente ajuda a não perder oportunidades.",
    href: "/dashboard/solicitacoes",
    botao: "Ver Solicitações",
  },
  {
    titulo: "Conheça seu Financeiro",
    descricao: "Acompanhe os registros de atendimentos, recebimentos e comissões disponíveis no seu painel.",
    dica: "Confira os registros regularmente e mantenha seus controles organizados.",
    href: "/dashboard-terapeuta/financeiro",
    botao: "Abrir Financeiro",
  },
];

export default function GuiaTerapeutaPage() {
  const [concluidas, setConcluidas] = useState<number[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const valores: unknown = JSON.parse(salvo);
        if (Array.isArray(valores)) {
          setConcluidas(
            valores.filter(
              (valor): valor is number =>
                Number.isInteger(valor) && valor >= 0 && valor < etapas.length
            )
          );
        }
      }
    } catch {
      // O guia continua funcionando mesmo se o armazenamento estiver indisponível.
    }
    setCarregado(true);
  }, []);

  function alternarEtapa(indice: number) {
    setConcluidas((anteriores) => {
      const proximas = anteriores.includes(indice)
        ? anteriores.filter((item) => item !== indice)
        : [...anteriores, indice];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proximas));
      } catch {
        // A marcação permanece disponível durante esta visita.
      }
      return proximas;
    });
  }

  const percentual = Math.round((concluidas.length / etapas.length) * 100);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-7">
        <section className="rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-violet-800 p-6 text-white shadow-xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-200">
            AuraMeets • Consultório Digital
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Guia do Terapeuta
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-purple-100 sm:text-base">
            Bem-vindo! Siga estas oito etapas, no seu ritmo, para preparar seu
            perfil, apresentar seus serviços e começar a receber solicitações.
          </p>
          <div className="mt-7 rounded-2xl border border-white/20 bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>Seu progresso</span>
              <span>{carregado ? `${concluidas.length} de ${etapas.length} etapas` : "Carregando..."}</span>
            </div>
            <div
              className="mt-3 h-3 overflow-hidden rounded-full bg-white/20"
              role="progressbar"
              aria-label="Progresso do guia"
              aria-valuenow={percentual}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${percentual}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-purple-100">{percentual}% concluído</p>
          </div>
        </section>

        <section className="space-y-4" aria-label="Etapas do guia">
          {etapas.map((etapa, indice) => {
            const concluida = concluidas.includes(indice);
            return (
              <article
                key={etapa.titulo}
                className={`rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${
                  concluida ? "border-emerald-300" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-lg font-extrabold text-purple-700">
                    {indice + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                      {etapa.titulo}
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {etapa.descricao}
                    </p>
                    <p className="mt-3 rounded-xl bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-900">
                      <strong>Dica:</strong> {etapa.dica}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={etapa.href}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-purple-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-700"
                      >
                        {etapa.botao} →
                      </Link>
                      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={concluida}
                          onChange={() => alternarEtapa(indice)}
                          className="h-5 w-5 accent-emerald-600"
                        />
                        {concluida ? "Etapa concluída" : "Marcar como concluída"}
                      </label>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-purple-200 bg-purple-50 p-6">
          <h2 className="text-xl font-bold text-slate-950">Precisa de orientação?</h2>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            Volte a este guia sempre que precisar. Você pode concluir as etapas
            aos poucos; suas marcações ficam salvas neste navegador.
          </p>
          <Link
            href="/dashboard-terapeuta"
            className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-purple-700 px-5 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-100"
          >
            Voltar ao painel
          </Link>
        </section>
      </div>
    </main>
  );
}
