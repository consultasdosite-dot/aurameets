"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "aurameets-guia-terapeuta-v1";

const etapas = [
  {
    titulo: "Complete seu perfil",
    descricao:
      "Adicione uma foto profissional, conte um pouco sobre sua trajetória e explique como você pode ajudar seus clientes.",
    dica:
      "Use palavras simples e uma foto nítida. Uma boa apresentação transmite confiança.",
    href: "/dashboard-terapeuta/perfil",
    botao: "Abrir Meu Perfil",
    opcional: false,
  },
  {
    titulo: "Selecione suas especialidades",
    descricao:
      "Escolha as terapias e as áreas em que você atua para ajudar os visitantes a encontrar seu trabalho.",
    dica: "Selecione apenas as especialidades que você realmente oferece.",
    href: "/dashboard-terapeuta/especialidades",
    botao: "Abrir Especialidades",
    opcional: false,
  },
  {
    titulo: "Cadastre seus serviços",
    descricao:
      "Informe o nome de cada atendimento, o que está incluído, a duração, a modalidade e o preço. Cadastre pacotes, se oferecer.",
    dica: "Comece pelo seu principal serviço. Depois, acrescente os demais.",
    href: "/dashboard-terapeuta/servicos",
    botao: "Cadastrar Serviços",
    opcional: false,
  },
  {
    titulo: "Configure seu Presente",
    descricao:
      "Se desejar, crie uma Experiência Presente gratuita para que novos clientes conheçam seu trabalho. Explique claramente o que será oferecido e as condições.",
    dica:
      "Esta etapa é opcional. Você não precisa oferecer presentes para ter um perfil completo.",
    href: "/dashboard-terapeuta/experiencias",
    botao: "Configurar Presente",
    opcional: true,
  },
  {
    titulo: "Crie um Desconto",
    descricao:
      "Se desejar, prepare uma oferta promocional, informando o serviço, o preço original, o valor com desconto e as condições da promoção.",
    dica:
      "Esta etapa é opcional. Você não precisa oferecer descontos para ter um perfil completo.",
    href: "/dashboard-terapeuta/promocao",
    botao: "Criar Desconto",
    opcional: true,
  },
  {
    titulo: "Organize sua agenda",
    descricao:
      "Confira seus horários disponíveis para receber solicitações de atendimento e evitar conflitos de agenda.",
    dica: "Revise sua disponibilidade sempre que houver alguma mudança.",
    href: "/agenda",
    botao: "Abrir Agenda",
    opcional: false,
  },
  {
    titulo: "Acompanhe as solicitações",
    descricao:
      "Consulte os pedidos recebidos, responda aos clientes e confirme os atendimentos ou proponha outro horário quando necessário.",
    dica: "Responder rapidamente ajuda a não perder oportunidades.",
    href: "/dashboard/solicitacoes",
    botao: "Ver Solicitações",
    opcional: false,
  },
  {
    titulo: "Conheça seu Financeiro",
    descricao:
      "Acompanhe os registros de atendimentos, recebimentos e comissões disponíveis no seu painel.",
    dica: "Confira os registros regularmente e mantenha seus controles organizados.",
    href: "/dashboard-terapeuta/financeiro",
    botao: "Abrir Financeiro",
    opcional: false,
  },
  {
    titulo: "Depoimentos dos meus clientes",
    descricao:
      "Cadastre depoimentos de clientes que você já atendeu, inclusive antes de participar do AuraMeets. Os depoimentos autorizados e aprovados poderão aparecer no seu minissite.",
    dica:
      "Esta etapa é opcional. Publique somente relatos verdadeiros e com autorização do cliente para divulgar nome, texto e eventual fotografia.",
    href: "/dashboard-terapeuta/depoimentos",
    botao: "CADASTRAR DEPOIMENTOS",
    opcional: true,
  },
];

export default function GuiaTerapeutaPage() {
  const [concluidas, setConcluidas] = useState<number[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [etapaAberta, setEtapaAberta] = useState<number | null>(null);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(STORAGE_KEY);

      if (salvo) {
        const valores: unknown = JSON.parse(salvo);

        if (Array.isArray(valores)) {
          setConcluidas(
            valores.filter(
              (valor): valor is number =>
                Number.isInteger(valor) &&
                valor >= 0 &&
                valor < etapas.length
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
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(proximas)
        );
      } catch {
        // A marcação permanece disponível durante esta visita.
      }

      if (!anteriores.includes(indice)) {
        const seguinte = etapas.findIndex((etapa, posicao) => !etapa.opcional && !proximas.includes(posicao));
        setEtapaAberta(seguinte >= 0 ? seguinte : null);
      }

      return proximas;
    });
  }

  const etapasObrigatorias = etapas
    .map((etapa, indice) => ({ ...etapa, indice }))
    .filter((etapa) => !etapa.opcional);

  const concluidasObrigatorias = etapasObrigatorias.filter((etapa) =>
    concluidas.includes(etapa.indice)
  ).length;

  const percentual = Math.round(
    (concluidasObrigatorias / etapasObrigatorias.length) * 100
  );

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="overflow-hidden">
          <img
            src="/aurameets-guia.png"
            alt="AuraMeets — Guia do Terapeuta"
            className="block h-auto w-full"
          />
        </div>

        <section className="border-b border-purple-200 pb-7 text-slate-900">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-700">
            AuraMeets • Consultório Digital
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Guia do Terapeuta
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Siga as seis etapas principais. Abra uma etapa, leia a orientação e
            acesse o campo indicado para preencher. Marque como concluída
            quando terminar. Presentes, descontos e depoimentos são opcionais.
          </p>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold">
              <span>Seu progresso</span>

              <span>
                {carregado
                  ? `${concluidasObrigatorias} de ${etapasObrigatorias.length} etapas`
                  : "Carregando..."}
              </span>
            </div>

            <div
              className="mt-3 h-3 overflow-hidden rounded-full bg-purple-100"
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

            <p className="mt-2 text-right text-xs text-slate-600">
              {percentual}% concluído
            </p>
          </div>
        </section>

        <section className="divide-y divide-purple-100" aria-label="Etapas do guia">
          {etapas.map((etapa, indice) => {
            const concluida = concluidas.includes(indice);
            const aberta = etapaAberta === indice || (etapaAberta === null && !concluida && indice === etapas.findIndex((item, posicao) => !item.opcional && !concluidas.includes(posicao)));

            return (
              <article
                key={etapa.titulo}
                className="py-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-lg font-extrabold text-purple-700">
                    {indice + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEtapaAberta(aberta ? -1 : indice)}
                        aria-expanded={aberta}
                        className="flex flex-1 items-center justify-between gap-3 text-left"
                      >
                        <h2 className="text-lg font-bold text-slate-950 sm:text-xl">
                          {etapa.titulo}
                        </h2>
                        <span className="shrink-0 text-xl font-bold text-purple-700" aria-hidden="true">
                          {aberta ? "−" : "+"}
                        </span>
                      </button>

                      {etapa.opcional && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-amber-800">
                          Opcional
                        </span>
                      )}
                    </div>

                    {concluida && (
                      <p className="mt-2 text-sm font-bold text-emerald-700">ETAPA CONCLUÍDA</p>
                    )}

                    {aberta && (
                      <>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {etapa.descricao}
                        </p>
                        {indice === 0 && (
                          <div className="mt-5 border-l-4 border-purple-700 bg-purple-50 px-5 py-4">
                            <h3 className="text-lg font-extrabold text-purple-950">
                              QUAL É O SEU PROPÓSITO COM A SUA ESPECIALIDADE?
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-slate-700">
                              Explique por que escolheu sua especialidade e como deseja ajudar as pessoas.
                              Escreva com suas próprias palavras.
                            </p>
                            <p className="mt-2 text-sm font-semibold text-purple-900">
                              Inclua essa resposta na sua apresentação profissional ao abrir Meu Perfil.
                            </p>
                          </div>
                        )}

                        <p className="mt-3 border-l-2 border-violet-200 pl-4 text-sm leading-6 text-violet-900">
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

                        {concluida
                          ? "Etapa concluída"
                          : "Marcar como concluída"}
                      </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="border-t border-purple-200 pt-7">
          <h2 className="text-xl font-bold text-slate-950">
            Precisa de orientação?
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-700">
            Volte a este guia sempre que precisar. Você pode concluir as
            etapas aos poucos; suas marcações ficam salvas neste navegador.
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