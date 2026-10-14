"use client";
import { useState } from "react";
import Link from "next/link";
const WHATSAPP =
  "https://wa.me/5551980339532?text=" +
  encodeURIComponent(
    "Olá, Oscar! Conheci o AuraMeets e gostaria de conversar sobre o Acolhimento com Fala Sistêmica."
  );
const WHATSAPP_JORNADA = "5551980339532";

const areasJornada = [
  "Relacionamentos",
  "Família",
  "Ansiedade e emoções",
  "Trabalho e finanças",
  "Autoconhecimento",
  "Espiritualidade",
];

const objetivosJornada = [
  "Quero ser acolhido(a)",
  "Preciso de orientação e clareza",
  "Quero me conhecer melhor",
];

type TipoIcone = "conversa" | "acolhimento" | "pessoas" | "agenda";
function Icone({ tipo }: { tipo: TipoIcone }) {
  const comum = {
    width: 35,
    height: 35,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  switch (tipo) {
    case "conversa":
      return (
        <svg {...comum}>
          <path d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 20l1.4-4A8 8 0 1 1 20 11.5Z" />
          <path d="M8 10h8M8 13h5" />
        </svg>
      );
    case "acolhimento":
      return (
        <svg {...comum}>
          <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11Z" />
          <path d="M8 12l3 3 5-5" />
        </svg>
      );
    case "pessoas":
      return (
        <svg {...comum}>
          <circle cx="12" cy="7" r="3" />
          <path d="M6 20v-2a6 6 0 0 1 12 0v2H6Z" />
          <path d="M4 9a2.5 2.5 0 0 0 0 5M20 9a2.5 2.5 0 0 1 0 5" />
        </svg>
      );
    case "agenda":
      return (
        <svg {...comum}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 3v4M17 3v4M3 10h18" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      );
  }
}
const etapas: {
  titulo: string;
  descricao: string;
  icone: TipoIcone;
  link: string;
  externo?: boolean;
}[] = [
  {
    titulo: "1. Conte o que está vivendo",
    descricao: "Compartilhe o que você procura neste momento.",
    icone: "conversa",
    link: "/jornada",
  },
  {
    titulo: "2. Encontre acolhimento",
    descricao: "Conheça possibilidades de cuidado e orientação.",
    icone: "acolhimento",
    link: WHATSAPP,
    externo: true,
  },
  {
    titulo: "3. Conheça terapeutas",
    descricao: "Encontre profissionais e seus serviços.",
    icone: "pessoas",
    link: "/",
  },
  {
    titulo: "4. Agende seu atendimento",
    descricao: "Escolha o profissional e o serviço desejado.",
    icone: "agenda",
    link: "/",
  },
];
export default function Home2() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [areasSelecionadas, setAreasSelecionadas] = useState<string[]>([]);
  const [objetivosSelecionados, setObjetivosSelecionados] = useState<string[]>([]);

  function alternarArea(opcao: string) {
    setAreasSelecionadas((anteriores) =>
      anteriores.includes(opcao)
        ? anteriores.filter((item) => item !== opcao)
        : [...anteriores, opcao]
    );
  }

  function alternarObjetivo(opcao: string) {
    setObjetivosSelecionados((anteriores) =>
      anteriores.includes(opcao)
        ? anteriores.filter((item) => item !== opcao)
        : [...anteriores, opcao]
    );
  }

  function solicitarAcolhimento() {
    if (!areasSelecionadas.length || !objetivosSelecionados.length) return;

    const mensagem = [
      "Olá! Vim pelo AuraMeets e gostaria de acolhimento.",
      "",
      "Minhas maiores preocupações hoje:",
      ...areasSelecionadas.map((item) => `- ${item}`),
      "",
      "O que procuro neste momento:",
      ...objetivosSelecionados.map((item) => `- ${item}`),
      "",
      "Gostaria de conversar com um atendente AuraMeets.",
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_JORNADA}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const podeContinuar = areasSelecionadas.length > 0 && objetivosSelecionados.length > 0;

  return (
    <main className="home2">
      <header className="cabecalho">
        <Link href="/home2" className="inicio">
          AuraMeets
        </Link>
        <button
          type="button"
          className="menuBotao"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
        >
          {menuAberto ? "✕" : "☰"}
        </button>
        <nav className={menuAberto ? "menu aberto" : "menu"}>
          <Link href="/">Terapeutas</Link>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/login">Entrar</Link>
        </nav>
      </header>
      <section className="apresentacao">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/home2-mobile.png"
          />
          <img
            src="/home2-desktop.png"
            alt="AuraMeets. O cuidado certo começa quando alguém realmente escuta você. Duas mãos se aproximando em um gesto de acolhimento."
            className="imagemPrincipal"
          />
        </picture>
        <div className="jornadaIntegrada">
          <p className="jornadaSelo">Jornada Expressa</p>
          <h1>Estamos aqui para acolher você.</h1>
          <p className="jornadaIntroducao">
            Escolha as respostas que representam seu momento. Você pode marcar mais de uma opção.
          </p>

          <section className="jornadaPergunta" aria-labelledby="pergunta-area">
            <h2 id="pergunta-area">QUAL A SUA MAIOR PREOCUPAÇÃO HOJE?</h2>
            <p>Selecione quantas opções desejar.</p>
            <div className="jornadaOpcoes jornadaDuasColunas">
              {areasJornada.map((opcao) => {
                const selecionada = areasSelecionadas.includes(opcao);
                return (
                  <button
                    key={opcao}
                    type="button"
                    aria-pressed={selecionada}
                    onClick={() => alternarArea(opcao)}
                    className={selecionada ? "jornadaOpcao selecionada" : "jornadaOpcao"}
                  >
                    <span>{opcao}</span>
                    <span className="jornadaMarcador" aria-hidden="true">{selecionada ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="jornadaPergunta" aria-labelledby="pergunta-objetivo">
            <h2 id="pergunta-objetivo">O que você procura neste momento?</h2>
            <p>Você pode escolher mais de uma resposta.</p>
            <div className="jornadaOpcoes">
              {objetivosJornada.map((opcao) => {
                const selecionada = objetivosSelecionados.includes(opcao);
                return (
                  <button
                    key={opcao}
                    type="button"
                    aria-pressed={selecionada}
                    onClick={() => alternarObjetivo(opcao)}
                    className={selecionada ? "jornadaOpcao selecionada" : "jornadaOpcao"}
                  >
                    <span>{opcao}</span>
                    <span className="jornadaMarcador" aria-hidden="true">{selecionada ? "✓" : ""}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            className="jornadaEnviar"
            onClick={solicitarAcolhimento}
            disabled={!podeContinuar}
          >
            QUERO SER ACOLHIDO →
          </button>
          <p className="jornadaAviso">
            O WhatsApp abrirá em uma nova aba com suas escolhas preenchidas. Basta enviar a mensagem.
          </p>
          <p className="jornadaAviso jornadaLegal">
            Este acolhimento inicial não constitui diagnóstico nem substitui acompanhamento médico ou psicológico.
          </p>
        </div>
        <button
          type="button"
          className="botaoAjuda"
          onClick={() => setAjudaAberta(!ajudaAberta)}
          aria-expanded={ajudaAberta}
          aria-controls="opcoes-ajuda"
        >
          Como podemos ajudar você?
          <span>{ajudaAberta ? "⌃" : "⌄"}</span>
        </button>
      </section>
      {ajudaAberta && (
        <section className="opcoes" id="opcoes-ajuda">
          <Link href="/">Conheça terapeutas</Link>
          <Link href="/login-terapeuta">Sou Terapeuta</Link>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preciso de Acolhimento
          </a>
        </section>
      )}
      <section className="comoFunciona">
        <div className="etapas">
          {etapas.map((etapa) => {
            const conteudo = (
              <>
                <div className="circulo">
                  <Icone tipo={etapa.icone} />
                </div>
                <h2>{etapa.titulo}</h2>
                <p>{etapa.descricao}</p>
              </>
            );
            return (
              <div className="etapa" key={etapa.titulo}>
                {etapa.externo ? (
                  <a
                    className="etapaConteudo"
                    href={etapa.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {conteudo}
                  </a>
                ) : (
                  <Link
                    className="etapaConteudo"
                    href={etapa.link}
                  >
                    {conteudo}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
      <section className="falaSistemica">
        <h2>Acolhimento com Fala Sistêmica</h2>
        <p>
          Um espaço de escuta, reflexão e acolhimento humanizado.
        </p>
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
        >
          Quero conversar agora
        </a>
      </section>
      <footer className="rodape">
        <p>AuraMeets — Conexões que acolhem.</p>
        <div>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/politica-de-privacidade">
            Política de Privacidade
          </Link>
        </div>
      </footer>
      <style jsx global>{`
        .home2 {
          min-height: 100vh;
          background: #fffaf7;
          color: #102657;
          font-family: Arial, Helvetica, sans-serif;
        }
        .home2 \* {
          box-sizing: border-box;
        }
        .home2 .cabecalho {
          height: 66px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fffaf7;
        }
        .home2 .inicio {
          font-size: 22px;
          font-weight: 800;
          color: #8546b3;
          text-decoration: none;
        }
        .home2 .menu {
          display: flex;
          gap: 25px;
        }
        .home2 .menu a {
          color: #102657;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }
        .home2 .menuBotao {
          display: none;
          border: 0;
          background: none;
          color: #9148bc;
          font-size: 28px;
          cursor: pointer;
        }
        .home2 .apresentacao {
          position: relative;
          text-align: center;
          background: #fffaf7;
        }
        .home2 .apresentacao picture {
          display: block;
          width: 100%;
        }
        .home2 .imagemPrincipal {
          display: block;
          width: 100%;
          height: auto;
        }
        .home2 .jornadaIntegrada {
          max-width: 768px;
          margin: 26px auto 36px;
          padding: 0 16px;
          text-align: center;
        }
        .home2 .jornadaSelo {
          color: #7653a6;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .home2 .jornadaIntegrada h1 {
          margin: 12px 0;
          font-size: clamp(27px, 4vw, 36px);
          line-height: 1.2;
        }
        .home2 .jornadaIntroducao {
          margin: 0 auto 22px;
          max-width: 550px;
          color: #58647a;
          line-height: 1.6;
        }
        .home2 .jornadaPergunta {
          margin: 16px 0;
          padding: 26px;
          border: 1px solid #e8ddf1;
          border-radius: 28px;
          background: white;
          text-align: left;
        }
        .home2 .jornadaPergunta h2 {
          margin: 0 0 10px;
          font-size: 21px;
          line-height: 1.3;
        }
        .home2 .jornadaPergunta p {
          margin: 0 0 18px;
          color: #68758a;
          font-size: 14px;
        }
        .home2 .jornadaOpcoes {
          display: grid;
          gap: 12px;
        }
        .home2 .jornadaDuasColunas {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .home2 .jornadaOpcao {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-height: 56px;
          padding: 14px 16px;
          border: 1px solid #e8ddf1;
          border-radius: 16px;
          background: #fcfafe;
          color: #24334f;
          font-size: 16px;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }
        .home2 .jornadaOpcao.selecionada {
          border-color: #7653a6;
          background: #f0e8fa;
          color: #553184;
        }
        .home2 .jornadaMarcador {
          display: flex;
          flex: 0 0 24px;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: 1px solid #c9b8d9;
          border-radius: 6px;
          background: white;
        }
        .home2 .jornadaOpcao.selecionada .jornadaMarcador {
          border-color: #7653a6;
          background: #7653a6;
          color: white;
        }
        .home2 .jornadaEnviar {
          margin-top: 12px;
          padding: 18px 32px;
          border: 0;
          border-radius: 16px;
          background: #7653a6;
          color: white;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
        }
        .home2 .jornadaEnviar:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .home2 .jornadaAviso {
          max-width: 520px;
          margin: 14px auto 0;
          color: #68758a;
          font-size: 14px;
          line-height: 1.5;
        }
        .home2 .jornadaLegal {
          font-size: 12px;
        }
        @media (max-width: 640px) {
          .home2 .jornadaDuasColunas {
            grid-template-columns: 1fr;
          }
          .home2 .jornadaPergunta {
            padding: 20px;
          }
          .home2 .jornadaEnviar {
            width: 100%;
          }
        }

        .home2 .botaoAjuda {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: -20px auto 28px;
          position: relative;
          z-index: 2;
          padding: 16px 26px;
          border: none;
          border-radius: 40px;
          background: #9146b6;
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 5px 16px rgba(80, 30, 120, 0.15);
        }
        .home2 .botaoAjuda span {
          font-size: 23px;
          line-height: 0.8;
        }
        .home2 .opcoes {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 14px;
          padding: 12px 20px 30px;
        }
        .home2 .opcoes a {
          text-decoration: none;
          border: 1px solid #d9c2e7;
          border-radius: 30px;
          padding: 14px 22px;
          color: #733a9b;
          background: white;
          font-weight: 700;
          text-align: center;
        }
        .home2 .comoFunciona {
          padding: 30px 4% 45px;
        }
        .home2 .etapas {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .home2 .etapa {
          min-width: 0;
        }
        .home2 .etapaConteudo {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          text-decoration: none;
          color: #102657;
          font-family: Arial, Helvetica, sans-serif;
        }
        .home2 .circulo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 85px;
          height: 85px;
          flex-shrink: 0;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: #f2e1fa;
          color: #8039a4;
        }
        .home2 .etapaConteudo h2 {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 17px;
          font-weight: 800;
          line-height: 1.3;
          margin: 0 0 10px;
          color: #102657;
        }
        .home2 .etapaConteudo p {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.5;
          margin: 0;
          color: #102657;
        }
        .home2 .falaSistemica {
          padding: 45px 20px;
          text-align: center;
          background: #f5eaf9;
        }
        .home2 .falaSistemica h2 {
          font-size: 24px;
          color: #70389d;
        }
        .home2 .falaSistemica p {
          line-height: 1.6;
          margin: 15px auto;
        }
        .home2 .falaSistemica a {
          display: inline-block;
          margin-top: 12px;
          padding: 15px 28px;
          border-radius: 30px;
          background: #9146b6;
          color: white;
          font-weight: 700;
          text-decoration: none;
        }
        .home2 .rodape {
          padding: 28px 15px;
          text-align: center;
          font-size: 13px;
        }
        .home2 .rodape div {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 25px;
          margin-top: 15px;
        }
        .home2 .rodape a {
          color: #70389d;
          text-decoration: none;
          font-size: 18px;
        }
        @media (max-width: 767px) {
          .home2 .rodape a {
            font-size: 16px;
          }
          .home2 .cabecalho {
            height: 54px;
            padding: 0 20px;
          }
          .home2 .inicio {
            font-size: 18px;
          }
          .home2 .menuBotao {
            display: block;
          }
          .home2 .menu {
            display: none;
            position: absolute;
            top: 54px;
            left: 0;
            right: 0;
            flex-direction: column;
            gap: 0;
            background: #fffaf7;
            z-index: 20;
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
          }
          .home2 .menu.aberto {
            display: flex;
          }
          .home2 .menu a {
            padding: 16px 22px;
            border-bottom: 1px solid #eee;
          }
          .home2 .botaoAjuda {
            width: calc(100% - 48px);
            max-width: 400px;
            margin-top: -16px;
            margin-bottom: 25px;
            font-size: 14px;
            padding: 15px 12px;
          }
          .home2 .opcoes {
            flex-direction: column;
            padding: 5px 22px 25px;
          }
          .home2 .comoFunciona {
            padding: 22px 12px 35px;
          }
          .home2 .etapas {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }
          .home2 .circulo {
            width: 58px;
            height: 58px;
            margin-bottom: 12px;
          }
          .home2 .circulo svg {
            width: 30px;
            height: 30px;
          }
          .home2 .etapaConteudo h2 {
            font-size: 12px;
            line-height: 1.25;
          }
          .home2 .etapaConteudo p {
            font-size: 11px;
            line-height: 1.4;
          }
          .home2 .falaSistemica {
            padding: 35px 18px;
          }
          .home2 .falaSistemica h2 {
            font-size: 21px;
          }
        }
        @media (max-width: 360px) {
          .home2 .etapas {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px;
          }
          .home2 .etapaConteudo h2 {
            font-size: 14px;
          }
          .home2 .etapaConteudo p {
            font-size: 12px;
          }
        }
      `}</style>
    </main>
  );
}
