"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFeaturedExperiences, getHomeTherapistsWithServices, type HomeExperienceTherapist, type FeaturedExperience } from "../lib/experiences/home";

const WHATSAPP = "5551980339532";

const necessidades = [
  { nome: "Relacionamentos", icone: "♡", cor: "#FFD5E7" },
  { nome: "Família", icone: "⌂", cor: "#E1C9FF" },
  { nome: "Ansiedade e emoções", icone: "♥", cor: "#D1E9FF" },
  { nome: "Trabalho e finanças", icone: "▥", cor: "#CBF5E9" },
  { nome: "Autoconhecimento", icone: "✧", cor: "#FFE4C4" },
  { nome: "Espiritualidade", icone: "✺", cor: "#E8D5FF" },
];

const abordagens = [
  "Numerologia",
  "Astrologia",
  "Tarô",
  "Constelação Familiar",
  "Psicanálise",
  "Terapias Integrativas",
];

const terapeutasSelecionados = [
  { nome: "Alzira", busca: ["alzira"] },
  { nome: "Renata Martins", busca: ["renata martins"] },
  { nome: "Renatta Godoi", busca: ["renatta godoi", "renata godoi"] },
  { nome: "Semiramis", busca: ["semiramis"] },
  { nome: "Milena", busca: ["milena"] },
  { nome: "Pollyanna", busca: ["pollyanna"] },
  { nome: "Pedro", busca: ["pedro"] },
  { nome: "Ricardo", busca: ["ricardo"] },
  { nome: "Tyemi", busca: ["tyemi"] },
  { nome: "Oscar", busca: ["oscar ahumada", "oscar"] },
  { nome: "Eunice", busca: ["eunice"] },
  { nome: "Kassia", busca: ["kassia", "kássia"] },
  { nome: "Fernanda", busca: ["fernanda"] },
];

function embaralharTerapeutas<T>(itens: T[]): T[] {
  const resultado = [...itens];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

type TerapeutaDestaque = { nome: string; profissao: string | null; foto: string | null; perfil: string | null };

function normalizarNome(nome: string) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function montarDestaques(
  terapeutas: HomeExperienceTherapist[],
  ofertas: FeaturedExperience[],
): TerapeutaDestaque[] {
  const destaques = terapeutasSelecionados.map((selecionado) => {
    const corresponde = (nome: string) => {
      const normalizado = normalizarNome(nome);
      return selecionado.busca.some((busca) =>
        normalizado === busca || normalizado.startsWith(`${busca} `),
      );
    };
    const terapeuta = terapeutas.find((item) => corresponde(item.name));
    const oferta = ofertas.find((item) => corresponde(item.therapist_name));
    const foto = terapeuta?.profile_photo_url || terapeuta?.photo_url || oferta?.therapist_photo_url || null;
    const perfil = terapeuta
      ? terapeuta.slug?.trim()
        ? `/terapeuta/${encodeURIComponent(terapeuta.slug.trim())}`
        : `/terapeutas?therapistId=${encodeURIComponent(String(terapeuta.id))}`
      : oferta?.public_href || null;
    const profissao = terapeuta?.speciality?.trim() || oferta?.therapist?.speciality?.trim() || null;
    return { nome: terapeuta?.name || oferta?.therapist_name || selecionado.nome, profissao, foto, perfil };
  }).filter((item) => item.perfil);

  const alzira = destaques.find((item) => normalizarNome(item.nome).startsWith("alzira"));
  const renata = destaques.find((item) => normalizarNome(item.nome).startsWith("renata martins"));
  const primeiros = [alzira, renata].filter((item): item is TerapeutaDestaque => Boolean(item));
  const restantes = destaques.filter((item) => item !== alzira && item !== renata);

  return [...embaralharTerapeutas(primeiros), ...embaralharTerapeutas(restantes)];
}

function Icone({ tipo }: { tipo: "pessoas" | "coracao" | "escudo" }) {
  if (tipo === "pessoas") return <span aria-hidden="true">♧</span>;
  if (tipo === "coracao") return <span aria-hidden="true">♡</span>;
  return <span aria-hidden="true">♢</span>;
}

export default function Home3() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [fala, setFala] = useState("");
  const [terapeutasDestaque, setTerapeutasDestaque] = useState<TerapeutaDestaque[]>(
    [],
  );
  const [carregandoTerapeutas, setCarregandoTerapeutas] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function carregarTerapeutas() {
      try {
        const [terapeutas, ofertas] = await Promise.all([
          getHomeTherapistsWithServices(),
          getFeaturedExperiences(),
        ]);
        if (ativo) setTerapeutasDestaque(montarDestaques(terapeutas, ofertas));
      } catch (erro) {
        console.error("Não foi possível carregar os terapeutas em destaque:", erro);
      } finally {
        if (ativo) setCarregandoTerapeutas(false);
      }
    }
    void carregarTerapeutas();
    return () => { ativo = false; };
  }, []);

  function solicitarFala() {
    if (!fala.trim()) return;

    const mensagem = [
      "Olá, Oscar! Conheci o AuraMeets.",
      "Gostaria de solicitar minha Fala Sistêmica gratuita.",
      "",
      "O que estou vivendo:",
      fala.trim(),
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <main className="home3">
      <header className="topo">
        <Link href="/home3" className="marca">
          <img
            src="/logo-aurameets-home3.png"
            alt="AuraMeets"
            className="marcaLogo"
          />
        </Link>

        <button
          type="button"
          className="menuMobile"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-expanded={menuAberto}
          aria-label="Abrir ou fechar menu"
        >
          {menuAberto ? "✕" : "☰"}
        </button>

        <nav className={menuAberto ? "navegacao aberta" : "navegacao"}>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/dashboard-terapeuta">ÁREA DO TERAPEUTA</Link>
          <Link href="/admin">ADMINISTRAÇÃO</Link>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Estou visitando o AuraMeets e gostaria de falar com um atendente.")}`}
            className="navDestaque"
            target="_blank"
            rel="noopener noreferrer"
          >
            FALE COM ATENDENTE
          </a>
        </nav>
      </header>

      <div className="conteudo">
        <section className="hero" id="comecar">
          <picture className="heroImagem">
            <source
              media="(max-width: 767px)"
              srcSet="/home2-mobile.png"
            />
            <img
              src="/home2-desktop.png"
              alt="Duas mãos se aproximando em um gesto de acolhimento"
            />
          </picture>

          <div className="heroConteudo">
            <span className="sobretitulo">BEM-VINDO AO AURAMEETS</span>
            <h1>Você não precisa caminhar sozinho.</h1>
            <p>
              Encontre um espaço de escuta, acolhimento e
              conexão com profissionais que podem contribuir
              com o seu momento de vida.
            </p>

            <div className="heroAcoes">
  <Link href="#terapeutas-destaque" className="botaoPrincipal" onClick={(evento) => { evento.preventDefault(); document.getElementById("terapeutas-destaque")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
    CONHECER TERAPEUTAS <span>→</span>
  </Link>

  <Link href="/jornada" className="botaoSecundario botaoJornada">
    DESCUBRA POR ONDE COMEÇAR
  </Link>

  <a
    href="https://wa.me/5551980339532?text=Ol%C3%A1%21%20Vim%20pelo%20AuraMeets%20e%20gostaria%20de%20falar%20com%20um%20atendente."
    target="_blank"
    rel="noopener noreferrer"
    className="botaoSecundario botaoAtendente"
  >
    FALE COM ATENDENTE
  </a>
</div>
          </div>
        </section>

        <section className="beneficios">
          <div>
            <span className="beneficioIcone">
              <Icone tipo="pessoas" />
            </span>
            <strong>Profissionais e especialidades</strong>
            <p>Conheça diferentes formas de cuidado e orientação.</p>
          </div>
          <div>
            <span className="beneficioIcone">
              <Icone tipo="coracao" />
            </span>
            <strong>Escolha com liberdade</strong>
            <p>Encontre quem combina com suas necessidades.</p>
          </div>
          <div>
            <span className="beneficioIcone">
              <Icone tipo="escudo" />
            </span>
            <strong>Respeito e acolhimento</strong>
            <p>Uma jornada orientada pela escuta e pela confiança.</p>
          </div>
        </section>

        {(() => {
          const alzira = terapeutasDestaque.find((item) => normalizarNome(item.nome).startsWith("alzira"));
          if (!alzira?.perfil) return null;
          return (
            <section className="experienciaPresenteDia" aria-label="Experiência Presente do Dia">
              <div className="experienciaDiaFoto">
                {alzira.foto ? <img src={alzira.foto} alt="Foto de Alzira" /> : <span aria-hidden="true">✧</span>}
              </div>
              <div className="experienciaDiaTexto">
                <span className="sobretitulo">SEGUNDA-FEIRA • 26/10/2026</span>
                <h2>EXPERIÊNCIA PRESENTE DO DIA</h2>
                <div className="experienciaDiaVoucher" aria-label="Voucher presente de Cartas de Odu com Alzira">
                  <span className="experienciaDiaSelo">VOUCHER PRESENTE • AURAMEETS</span>
                  <strong>CARTAS DE ODU</strong>
                  <span>Autoconhecimento e Orientação</span>
                  <p>Descubra o que as Cartas de Odu podem revelar sobre o momento que você está vivendo, trazendo clareza sobre seus desafios e orientação para escolhas mais conscientes.</p>
                  <small>Com Alzira • Segunda-feira, 26/10/2026</small>
                </div>
                <a href={`https://wa.me/5543999880296?text=${encodeURIComponent("Olá, Alzira! Conheci sua experiência Cartas de Odu no AuraMeets e gostaria de solicitar meu voucher.")}`} target="_blank" rel="noopener noreferrer" className="botaoPrincipal botaoVoucher">QUERO VOUCHER <span>→</span></a>
              </div>
            </section>
          );
        })()}

        <section className="terapeutasDestaque" id="terapeutas-destaque">
          <div className="tituloCentral">
            <span className="sobretitulo">CONEXÕES QUE ACOLHEM</span>
            <h2>Conheça nossos terapeutas em destaque</h2>
            <p>Escolha um profissional e conheça sua trajetória e seus serviços.</p>
          </div>
          <div className="gradeTerapeutas">
            {terapeutasDestaque.map((terapeuta) => {
              const conteudo = (
                <>
                  <span className="fotoTerapeuta">
                    {terapeuta.foto ? (
                      <img src={terapeuta.foto} alt={`Foto de ${terapeuta.nome}`} />
                    ) : (
                      <span aria-hidden="true">✧</span>
                    )}
                  </span>
                  <strong>{terapeuta.nome.trim().split(/\s+/).slice(0, 2).map((parte) => parte.charAt(0).toLocaleUpperCase("pt-BR") + parte.slice(1).toLocaleLowerCase("pt-BR")).join(" ")}</strong>
                  {terapeuta.profissao && <span className="profissaoTerapeuta">{terapeuta.profissao}</span>}
                  <small>{terapeuta.perfil ? "CONHECER PROFISSIONAL →" : carregandoTerapeutas ? "Carregando..." : "Perfil indisponível"}</small>
                </>
              );
              return terapeuta.perfil ? (
                <Link href={terapeuta.perfil} className="cartaoTerapeuta" key={terapeuta.nome}>
                  {conteudo}
                </Link>
              ) : (
                <div className="cartaoTerapeuta" key={terapeuta.nome}>
                  {conteudo}
                </div>
              );
            })}
          </div>
          <div className="todosTerapeutasAcao">
            <Link href="/terapeutas" className="botaoContorno">
              VER TODOS OS TERAPEUTAS <span>→</span>
            </Link>
          </div>
        </section>

        <section className="guia bloco" id="guia">
          <div className="guiaTexto">
            <span className="sobretitulo">NÃO SABE POR ONDE COMEÇAR?</span>
            <h2>Encontre caminhos para o seu momento.</h2>
            <p>
              Não sabe qual abordagem escolher? Nossa Jornada
              Expressa ajuda você a identificar suas principais
              preocupações e o tipo de acolhimento que procura.
            </p>
            <Link href="/jornada" className="botaoPrincipal">
              FAZER O GUIA RÁPIDO <span>→</span>
            </Link>
            <small>Simples, rápido e com múltiplas escolhas.</small>
          </div>

          <div className="guiaIlustracao" aria-hidden="true">
            <span className="circuloGrande">✧</span>
            <div className="guiaLista">
              <span>✓ Identifique suas necessidades</span>
              <span>✓ Reflita sobre o que procura</span>
              <span>✓ Solicite acolhimento</span>
            </div>
          </div>
        </section>

        <section className="areas" id="areas">
          <div className="tituloCentral">
            <h2>Em que podemos apoiar você?</h2>
            <p>
              Conheça algumas necessidades e áreas de interesse
              que podem fazer parte da sua busca.
            </p>
          </div>

          <div className="gradeAreas">
            {necessidades.map((item) => (
              <Link
                href="/"
                key={item.nome}
                className="areaCard"
                style={{ background: item.cor }}
              >
                <span className="areaIcone">{item.icone}</span>
                <strong>{item.nome}</strong>
              </Link>
            ))}
          </div>

          <h3 className="subtituloAreas">Explore também por abordagem</h3>
          <div className="abordagens">
            {abordagens.map((item) => (
              <Link href="/" key={item}>
                {item}
              </Link>
            ))}
          </div>

        </section>

        <section className="comoFunciona" id="como-funciona">
          <div className="tituloCentral">
            <h2>Como funciona o AuraMeets?</h2>
            <p>Três passos para encontrar o atendimento que procura.</p>
          </div>

          <div className="passos">
            <div className="passo">
              <span>01</span>
              <h3>Conheça</h3>
              <p>
                Explore profissionais, especialidades e
                serviços disponíveis.
              </p>
            </div>
            <div className="passo">
              <span>02</span>
              <h3>Escolha</h3>
              <p>
                Encontre um terapeuta e um atendimento
                alinhados ao que procura.
              </p>
            </div>
            <div className="passo">
              <span>03</span>
              <h3>Conecte-se</h3>
              <p>
                Entre em contato e combine seu atendimento
                conforme as condições do profissional.
              </p>
            </div>
          </div>

          <div className="confianca">
            <strong>Respeito, transparência e liberdade de escolha.</strong>
            <p>
              O AuraMeets aproxima pessoas e profissionais.
              Cada terapeuta responde por suas qualificações,
              serviços e condições de atendimento.
            </p>
            <Link href="/quem-somos">Conheça nossa história →</Link>
          </div>
        </section>

        <section className="falaSistemica bloco" id="fala-sistemica">
          <div className="falaConteudo">
            <span className="sobretitulo">UMA EXPERIÊNCIA GRATUITA</span>
            <h2>Fala Sistêmica</h2>
            <h3>Um espaço para expressar o que você está vivendo.</h3>
            <p>
              Compartilhe, com suas próprias palavras, o que
              está acontecendo em sua vida. Sua mensagem será
              encaminhada pelo WhatsApp para Oscar Ahumada,
              que poderá preparar uma Fala Sistêmica personalizada.
            </p>

            <label htmlFor="mensagem-fala">
              O que você gostaria de compartilhar?
            </label>
            <textarea
              id="mensagem-fala"
              value={fala}
              onChange={(evento) => setFala(evento.target.value)}
              placeholder="Escreva aqui o que está vivendo neste momento..."
              rows={4}
            />

            <button
              type="button"
              className="botaoPrincipal"
              onClick={solicitarFala}
              disabled={!fala.trim()}
            >
              SOLICITAR MINHA FALA SISTÊMICA <span>→</span>
            </button>

            <small>
              O WhatsApp abrirá em outra aba. A mensagem só será
              enviada após sua confirmação.
            </small>
          </div>

          <div className="falaDecoracao" aria-hidden="true">
            <span>✧</span>
            <p>Escuta. Reflexão. Novas perspectivas.</p>
          </div>
        </section>

      </div>

      <footer className="rodape">
        <div>
          <strong>AuraMeets</strong>
          <small>Conexões que acolhem.</small>
        </div>
        <nav>
          <Link href="/quem-somos">Quem Somos</Link>
          <Link href="/">Terapeutas</Link>
          <Link href="/politica-de-privacidade">
            Política de Privacidade
          </Link>
        </nav>
      </footer>

      <style jsx global>{`
        .home3 {
          min-height: 100vh;
          background: #fffcf9;
          color: #142951;
          font-family: Arial, Helvetica, sans-serif;
        }
        .home3 * { box-sizing: border-box; }
        .home3 a { text-decoration: none; }
        .home3 .topo {
          min-height: 78px;
          padding: 12px 4%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: white;
        }
        .home3 .marca {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7735c5;
        }
        .home3 .marcaLogo {
          display: block;
          width: min(240px, 60vw);
          height: auto;
          object-fit: contain;
        }
        .home3 .navegacao {
          display: flex;
          align-items: center;
          gap: 21px;
        }
        .home3 .navegacao a {
          color: #25344d;
          font-size: 12px;
          font-weight: 700;
        }
        .home3 .navegacao .navDestaque {
          padding: 12px 21px;
          border-radius: 30px;
          background: #25D366;
          color: white;
        }
        .home3 .menuMobile { display: none; }
        .home3 .conteudo {
          max-width: 1320px;
          margin: auto;
          padding: 0 24px;
        }
        .home3 .hero {
          position: relative;
          overflow: hidden;
          min-height: 440px;
          border-radius: 0 0 16px 16px;
          background: #ffe4cf;
        }
        .home3 .heroImagem,
        .home3 .heroImagem img {
          display: block;
          width: 100%;
          height: 100%;
        }
        .home3 .heroImagem {
          position: absolute;
          inset: 0;
        }
        .home3 .heroImagem img {
          object-fit: cover;
          object-position: center;
        }
        .home3 .heroConteudo {
          position: relative;
          z-index: 1;
          width: min(54%, 610px);
          padding: 65px 40px 55px;
          background: linear-gradient(
            90deg,
            rgba(255,250,244,.96) 0%,
            rgba(255,250,244,.85) 65%,
            transparent 100%
          );
        }
        .home3 .sobretitulo {
          color: #7735c5;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .home3 h1,
        .home3 h2 {
          font-family: Georgia, "Times New Roman", serif;
          color: #142951;
        }
        .home3 h1 {
          margin: 18px 0;
          font-size: clamp(34px, 4vw, 58px);
          line-height: 1.08;
        }
        .home3 h2 {
          margin: 12px 0;
          font-size: clamp(27px, 3vw, 39px);
          line-height: 1.17;
        }
        .home3 p {
          line-height: 1.6;
        }
        .home3 .heroConteudo p {
          font-size: 17px;
          max-width: 460px;
        }
        .home3 .heroAcoes,
        .home3 .acoesFinais {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 25px;
        }
        .home3 .botaoPrincipal,
        .home3 .botaoSecundario,
        .home3 .botaoContorno {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          min-height: 48px;
          padding: 13px 23px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 800;
          text-align: center;
          cursor: pointer;
        }
        .home3 .botaoPrincipal {
          background: #7735c5;
          color: white;
          border: 1px solid #7735c5;
        }
        .home3 .botaoPrincipal:disabled {
          opacity: .45;
          cursor: not-allowed;
        }
        .home3 .botaoSecundario,
        .home3 .botaoContorno {
          background: rgba(255,255,255,.88);
          border: 1px solid #7735c5;
          color: #7735c5;
        }
        .home3 .heroAcoes .botaoJornada {
          background: #981F50;
          border-color: #981F50;
          color: #ffffff;
        }
        .home3 .experienciaPresenteDia .botaoVoucher {
          background: #25D366;
          border-color: #25D366;
          color: #ffffff;
        }
        .home3 .heroAcoes .botaoAtendente {
          background: #25D366;
          border-color: #25D366;
          color: #ffffff;
        }
        .home3 .beneficios {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          padding: 33px 20px;
          text-align: center;
        }
        .home3 .beneficios > div {
          max-width: 320px;
          margin: auto;
        }
        .home3 .beneficioIcone {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          margin: 0 auto 12px;
          border-radius: 50%;
          background: #e1c9ff;
          color: #7735c5;
          font-size: 35px;
        }
        .home3 .beneficios strong {
          display: block;
          font-size: 15px;
        }
        .home3 .beneficios p {
          font-size: 13px;
          margin: 7px 0 0;
        }
        .home3 .bloco {
          margin: 16px 0;
          padding: 44px;
          border-radius: 18px;
        }
        .home3 .experienciaPresenteDia {
          display: flex;
          align-items: center;
          gap: 28px;
          margin: 18px 0 8px;
          padding: 26px;
          border: 1px solid #e6c887;
          border-radius: 20px;
          background: linear-gradient(120deg, #fff9e9, #f1e7ff);
        }
        .home3 .experienciaDiaFoto {
          flex: 0 0 160px;
          width: 160px;
          height: 160px;
          overflow: hidden;
          border-radius: 18px;
          background: #e1c9ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 65px;
          color: #7735c5;
        }
        .home3 .experienciaDiaFoto img { width: 100%; height: 100%; object-fit: cover; }
        .home3 .experienciaDiaTexto { flex: 1; min-width: 0; }
        .home3 .experienciaDiaTexto h2 {
          display: block;
          width: 100%;
          margin: 16px 0 20px;
          padding: 18px 16px;
          border-radius: 14px;
          background: #7735C5;
          color: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 900;
          line-height: 1.25;
          text-align: center;
          letter-spacing: 0.02em;
        }
        .home3 .experienciaDiaVoucher {
          display: flex; flex-direction: column; gap: 9px;
          padding: 22px; margin: 18px 0;
          border: 1px solid #d5b66e; border-radius: 17px;
          background: linear-gradient(135deg, #fffdf7, #f8ebd1);
          box-shadow: 0 8px 22px #76591a14;
        }
        .home3 .experienciaDiaSelo { font-size: 11px; font-weight: 800; letter-spacing: 1.6px; color: #956719; }
        .home3 .experienciaDiaVoucher strong { font-family: Georgia, serif; font-size: clamp(24px, 3vw, 34px); color: #583282; }
        .home3 .experienciaDiaVoucher > span:not(.experienciaDiaSelo) { font-weight: 700; color: #25344d; }
        .home3 .experienciaDiaVoucher p { margin: 5px 0; font-size: 14px; }
        .home3 .experienciaDiaVoucher small { font-weight: 700; color: #79582d; }
        .home3 .experienciaDiaTexto > .botaoPrincipal:not(.botaoVoucher) { background: #7735c5; color: #fff; }

        @media (max-width: 767px) {
          .home3 .experienciaPresenteDia { flex-direction: column; padding: 20px; text-align: center; }
          .home3 .experienciaDiaFoto { flex-basis: 140px; width: 140px; height: 140px; }
        }
        .home3 .terapeutasDestaque {
          padding: 45px 22px;
          margin: 14px 0 24px;
          border-radius: 20px;
          background: linear-gradient(115deg, #eee0ff, #ffe3ee 55%, #e0f6f1);
        }
        .home3 .gradeTerapeutas {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .home3 .todosTerapeutasAcao {
          display: flex;
          justify-content: center;
          margin-top: 26px;
        }
        .home3 .cartaoTerapeuta {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 0;
          padding: 0 0 20px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #eadff4;
          border-radius: 20px;
          text-align: center;
          color: #25305a;
          box-shadow: 0 10px 26px #60249a16;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .home3 a.cartaoTerapeuta:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px #60249a30;
        }
        .home3 .fotoTerapeuta {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, #7735c5, #ef649a);
          color: #fff;
          font-size: 54px;
        }
        .home3 .fotoTerapeuta img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 25%;
        }
        .home3 .cartaoTerapeuta strong {
          margin: 18px 12px 10px;
          font-size: 20px;
          line-height: 1.3;
        }
        .home3 .profissaoTerapeuta {
          display: block;
          align-self: center;
          max-width: calc(100% - 30px);
          padding: 9px 17px;
          border-radius: 20px;
          background: #f0e4ff;
          color: #6931a5;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }
        .home3 .cartaoTerapeuta small {
          align-self: center;
          margin: 18px 12px 0;
          padding: 12px 20px;
          border-radius: 24px;
          background: #7735c5;
          color: white;
          font-size: 12px;
          font-weight: 800;
        }
        .home3 .guia {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          gap: 30px;
          background: linear-gradient(115deg, #e7d4ff, #ffe2d0);
        }
        .home3 .guiaTexto p {
          max-width: 560px;
        }
        .home3 .guiaTexto small,
        .home3 .falaConteudo small {
          display: block;
          margin-top: 13px;
          color: #626a79;
          font-size: 12px;
        }
        .home3 .guiaIlustracao {
          min-height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .home3 .circuloGrande {
          font-size: 125px;
          color: #7735c5;
        }
        .home3 .guiaLista {
          display: grid;
          gap: 16px;
        }
        .home3 .guiaLista span {
          padding: 13px 17px;
          border-radius: 14px;
          background: rgba(255,255,255,.9);
          font-size: 14px;
        }
        .home3 .escolhaDireta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
          border: 1px solid #efe3f2;
          background: white;
        }
        .home3 .escolhaDireta > div:first-child {
          max-width: 690px;
        }
        .home3 .simboloEscolha {
          font-size: 140px;
          line-height: 1;
          color: #ef649a;
          padding-right: 60px;
        }
        .home3 .areas,
        .home3 .comoFunciona,
        .home3 .credibilidade {
          padding: 45px 5px;
        }
        .home3 .tituloCentral {
          text-align: center;
          margin-bottom: 28px;
        }
        .home3 .tituloCentral p {
          margin: 0;
          color: #5b6477;
        }
        .home3 .gradeAreas {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }
        .home3 .areaCard {
          min-height: 135px;
          border-radius: 15px;
          padding: 18px 10px;
          color: #233459;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .home3 .areaIcone {
          font-size: 42px;
          color: #7735c5;
          line-height: 1;
        }
        .home3 .areaCard strong {
          font-size: 13px;
        }
        .home3 .subtituloAreas {
          margin: 30px 0 16px;
          text-align: center;
          font-size: 17px;
        }
        .home3 .abordagens {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }
        .home3 .abordagens a {
          border: 1px solid #e3d1eb;
          border-radius: 24px;
          background: white;
          padding: 12px 18px;
          color: #7735c5;
          font-size: 13px;
          font-weight: 700;
        }
        .home3 .avisoAreas {
          font-size: 12px;
          color: #747b87;
          text-align: center;
          margin-top: 18px;
        }
        .home3 .comoFunciona {
          background: #f1e7ff;
          border-radius: 18px;
        }
        .home3 .passos {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .home3 .passo {
          padding: 28px 24px;
          background: white;
          border-radius: 16px;
          text-align: center;
        }
        .home3 .passo span {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #e1c9ff;
          color: #76369d;
          font-weight: 800;
        }
        .home3 .passo h3 {
          font-size: 19px;
          margin-bottom: 8px;
        }
        .home3 .passo p {
          font-size: 14px;
        }
        .home3 .confianca {
          max-width: 800px;
          margin: 32px auto 0;
          text-align: center;
        }
        .home3 .confianca a {
          color: #2678d9;
          font-weight: 800;
        }
        .home3 .falaSistemica {
          display: grid;
          grid-template-columns: 1.4fr .6fr;
          align-items: center;
          gap: 35px;
          background: linear-gradient(115deg, #ffe2df, #e1d2ff);
        }
        .home3 .falaConteudo h3 {
          margin: 12px 0;
          font-size: 18px;
        }
        .home3 .falaConteudo label {
          display: block;
          margin: 20px 0 8px;
          font-weight: 700;
          font-size: 14px;
        }
        .home3 .falaConteudo textarea {
          display: block;
          width: 100%;
          max-width: 660px;
          padding: 16px;
          border: 1px solid #d7bee5;
          border-radius: 14px;
          font: inherit;
          font-size: 15px;
          resize: vertical;
          background: white;
          color: #142951;
          margin-bottom: 16px;
        }
        .home3 .falaDecoracao {
          text-align: center;
          color: #7735c5;
        }
        .home3 .falaDecoracao span {
          font-size: 160px;
        }
        .home3 .falaDecoracao p {
          font-family: Georgia, serif;
          font-size: 23px;
        }
        .home3 .conviteFinal {
          background: linear-gradient(120deg, #e3ceff, #ffe4cf);
          text-align: center;
        }
        .home3 .conviteFinal p {
          max-width: 680px;
          margin: 12px auto;
        }
        .home3 .acoesFinais {
          justify-content: center;
        }
        .home3 .rodape {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 22px;
          padding: 35px 5%;
          background: #fff;
        }
        .home3 .rodape strong {
          display: block;
          font-family: Georgia, serif;
          color: #7735c5;
          font-size: 26px;
        }
        .home3 .rodape small {
          color: #657082;
        }
        .home3 .rodape nav {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .home3 .rodape nav a {
          font-size: 14px;
          color: #7735c5;
          font-weight: 700;
        }
        @media (max-width: 950px) {
          .home3 .menuMobile {
            display: block;
            background: none;
            border: none;
            font-size: 28px;
            color: #7839a0;
          }
          .home3 .topo { position: relative; }
          .home3 .navegacao { display: none; }
          .home3 .navegacao.aberta {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 20;
            padding: 20px;
            background: white;
            box-shadow: 0 12px 25px #00000015;
          }
          .home3 .navegacao a {
            padding: 10px 0;
            font-size: 15px;
          }
          .home3 .heroConteudo { width: 68%; }
          .home3 .gradeTerapeutas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .home3 .gradeAreas {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 767px) {
          .home3 .conteudo { padding: 0 12px; }
          .home3 .marcaLogo { width: min(205px, 58vw); }
          .home3 .hero {
            min-height: auto;
            display: flex;
            flex-direction: column;
          }
          .home3 .heroImagem {
            position: relative;
            height: auto;
          }
          .home3 .heroImagem img {
            height: auto;
            object-fit: contain;
          }
          .home3 .heroConteudo {
            width: 100%;
            padding: 27px 20px 30px;
            background: #ffe9e0;
          }
          .home3 h1 { font-size: 36px; }
          .home3 h2 { font-size: 29px; }
          .home3 .heroConteudo p { font-size: 15px; }
          .home3 .heroAcoes,
          .home3 .acoesFinais {
            flex-direction: column;
          }
          .home3 .heroAcoes a,
          .home3 .acoesFinais a {
            width: 100%;
          }
          .home3 .beneficios {
            gap: 12px;
            padding: 25px 5px;
          }
          .home3 .beneficioIcone {
            width: 48px;
            height: 48px;
            font-size: 27px;
          }
          .home3 .beneficios strong { font-size: 12px; }
          .home3 .beneficios p { font-size: 11px; }
          .home3 .bloco {
            padding: 26px 20px;
          }
          .home3 .guia,
          .home3 .falaSistemica {
            grid-template-columns: 1fr;
          }
          .home3 .guiaIlustracao {
            min-height: 100px;
          }
          .home3 .circuloGrande { font-size: 65px; }
          .home3 .guiaLista span { font-size: 12px; }
          .home3 .simboloEscolha,
          .home3 .falaDecoracao {
            display: none;
          }
          .home3 .terapeutasDestaque { padding: 30px 12px; }
          .home3 .gradeTerapeutas { grid-template-columns: 1fr; gap: 18px; }
          .home3 .cartaoTerapeuta { padding-bottom: 22px; }
          .home3 .fotoTerapeuta { height: 270px; }
          .home3 .cartaoTerapeuta strong { font-size: 22px; }
          .home3 .cartaoTerapeuta small { font-size: 12px; }
          .home3 .gradeAreas {
            grid-template-columns: repeat(2, 1fr);
          }
          .home3 .areaCard { min-height: 115px; }
          .home3 .passos { grid-template-columns: 1fr; }
          .home3 .areas,
          .home3 .comoFunciona,
          .home3 .credibilidade {
            padding: 30px 5px;
          }
          .home3 .rodape {
            flex-direction: column;
            text-align: center;
          }
          .home3 .rodape nav {
            justify-content: center;
          }
        }
      `}</style>
    </main>
  );
}
