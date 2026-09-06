"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

const LARGURA = 1080;
const ALTURA = 1920;

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => resolve(imagem);
    imagem.onerror = reject;
    imagem.src = src;
  });
}

function desenharImagemCover(
  contexto: CanvasRenderingContext2D,
  imagem: HTMLImageElement,
  x: number,
  y: number,
  largura: number,
  altura: number
) {
  const escala = Math.max(largura / imagem.width, altura / imagem.height);
  const larguraFinal = imagem.width * escala;
  const alturaFinal = imagem.height * escala;

  contexto.drawImage(
    imagem,
    x + (largura - larguraFinal) / 2,
    y + (altura - alturaFinal) / 2,
    larguraFinal,
    alturaFinal
  );
}

function desenharTextoQuebrado(
  contexto: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  larguraMaxima: number,
  alturaLinha: number
) {
  const palavras = texto.trim().split(/\s+/);
  const linhas: string[] = [];
  let linha = "";

  palavras.forEach((palavra) => {
    const teste = linha ? `${linha} ${palavra}` : palavra;

    if (contexto.measureText(teste).width > larguraMaxima && linha) {
      linhas.push(linha);
      linha = palavra;
    } else {
      linha = teste;
    }
  });

  if (linha) linhas.push(linha);

  linhas.slice(0, 3).forEach((item, indice) => {
    contexto.fillText(item, x, y + indice * alturaLinha);
  });
}

export default function GeradorDivulgacaoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [nome, setNome] = useState("Nome profissional");
  const [especialidades, setEspecialidades] = useState(
    "Especialidade principal\nSegunda especialidade"
  );
  const [foto, setFoto] = useState<HTMLImageElement | null>(null);
  const [carregando, setCarregando] = useState(true);

  const desenharArte = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const contexto = canvas.getContext("2d");
    if (!contexto) return;

    contexto.clearRect(0, 0, LARGURA, ALTURA);

    try {
      const fundo = await carregarImagem("/fundo-divulgacao-terapeuta.png");
      desenharImagemCover(contexto, fundo, 0, 0, LARGURA, ALTURA);
    } catch {
      const degradê = contexto.createLinearGradient(0, 0, 0, ALTURA);
      degradê.addColorStop(0, "#160920");
      degradê.addColorStop(0.5, "#40124f");
      degradê.addColorStop(1, "#120717");
      contexto.fillStyle = degradê;
      contexto.fillRect(0, 0, LARGURA, ALTURA);
    }

    contexto.fillStyle = "rgba(7, 0, 14, 0.22)";
    contexto.fillRect(0, 0, LARGURA, ALTURA);

    try {
      const logo = await carregarImagem("/logo-aurameets.jpg");

      contexto.save();
      contexto.globalCompositeOperation = "screen";

      contexto.drawImage(
        logo,
        0,
        logo.height * 0.12,
        logo.width,
        logo.height * 0.72,
        175,
        35,
        730,
        365
      );

      contexto.restore();
    } catch {
      contexto.textAlign = "center";
      contexto.fillStyle = "#e4ba58";
      contexto.font = "700 72px Georgia";
      contexto.fillText("AURAMEETS", LARGURA / 2, 220);
    }

    const fotoX = 135;
    const fotoY = 385;
    const fotoLargura = 810;
    const fotoAltura = 900;
    const raio = 70;

    contexto.save();
    contexto.beginPath();
    contexto.roundRect(fotoX, fotoY, fotoLargura, fotoAltura, raio);
    contexto.clip();

    if (foto) {
      desenharImagemCover(
        contexto,
        foto,
        fotoX,
        fotoY,
        fotoLargura,
        fotoAltura
      );
    } else {
      const degradêFoto = contexto.createLinearGradient(
        fotoX,
        fotoY,
        fotoX,
        fotoY + fotoAltura
      );

      degradêFoto.addColorStop(0, "rgba(227, 185, 91, 0.28)");
      degradêFoto.addColorStop(1, "rgba(44, 10, 55, 0.75)");

      contexto.fillStyle = degradêFoto;
      contexto.fillRect(fotoX, fotoY, fotoLargura, fotoAltura);

      contexto.fillStyle = "rgba(255, 255, 255, 0.85)";
      contexto.textAlign = "center";
      contexto.font = "500 42px Arial";
      contexto.fillText(
        "A foto do terapeuta aparecerá aqui",
        LARGURA / 2,
        fotoY + fotoAltura / 2
      );
    }

    contexto.restore();

    contexto.save();
    contexto.strokeStyle = "#e4ba58";
    contexto.lineWidth = 7;
    contexto.shadowColor = "rgba(228, 186, 88, 0.8)";
    contexto.shadowBlur = 24;
    contexto.beginPath();
    contexto.roundRect(fotoX, fotoY, fotoLargura, fotoAltura, raio);
    contexto.stroke();
    contexto.restore();

    const faixa = contexto.createLinearGradient(0, 1240, 0, ALTURA);
    faixa.addColorStop(0, "rgba(23, 4, 31, 0.2)");
    faixa.addColorStop(0.25, "rgba(23, 4, 31, 0.87)");
    faixa.addColorStop(1, "rgba(9, 1, 15, 0.98)");

    contexto.fillStyle = faixa;
    contexto.fillRect(0, 1210, LARGURA, 710);

    contexto.textAlign = "center";
    contexto.shadowColor = "rgba(0, 0, 0, 0.8)";
    contexto.shadowBlur = 12;

    contexto.fillStyle = "#f1c75e";
    contexto.font = "700 86px Georgia";
    desenharTextoQuebrado(
      contexto,
      nome || "Nome profissional",
      LARGURA / 2,
      1430,
      900,
      94
    );

    contexto.shadowBlur = 8;
    contexto.fillStyle = "#ffffff";
    contexto.font = "500 43px Georgia";

    const especialidadesLimpas = especialidades
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    especialidadesLimpas.slice(0, 3).forEach((item, indice) => {
      contexto.fillText(item, LARGURA / 2, 1570 + indice * 58);
    });

    const botaoX = 175;
    const botaoY = 1770;
    const botaoLargura = 730;
    const botaoAltura = 105;

    const degradêBotao = contexto.createLinearGradient(
      botaoX,
      botaoY,
      botaoX,
      botaoY + botaoAltura
    );

    degradêBotao.addColorStop(0, "#f3d477");
    degradêBotao.addColorStop(0.5, "#c89931");
    degradêBotao.addColorStop(1, "#8e651b");

    contexto.shadowColor = "rgba(236, 190, 77, 0.55)";
    contexto.shadowBlur = 28;
    contexto.fillStyle = degradêBotao;
    contexto.beginPath();
    contexto.roundRect(
      botaoX,
      botaoY,
      botaoLargura,
      botaoAltura,
      22
    );
    contexto.fill();

    contexto.shadowBlur = 5;
    contexto.fillStyle = "#2a1500";
    contexto.font = "800 39px Arial";
    contexto.fillText(
      "PEÇA SUA EXPERIÊNCIA PRESENTE",
      LARGURA / 2,
      1838
    );

    contexto.shadowBlur = 0;
    setCarregando(false);
  }, [nome, especialidades, foto]);

  useEffect(() => {
    desenharArte();
  }, [desenharArte]);

  function selecionarFoto(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    const endereco = URL.createObjectURL(arquivo);
    const imagem = new Image();

    imagem.onload = () => {
      setFoto(imagem);
      URL.revokeObjectURL(endereco);
    };

    imagem.src = endereco;
  }

  function baixarArte() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nomeArquivo =
      nome
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "terapeuta";

    const link = document.createElement("a");
    link.download = `aurameets-${nomeArquivo}.png`;
    link.href = canvas.toDataURL("image/png", 1);
    link.click();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #40134f 0%, #170820 48%, #08040d 100%)",
        color: "#ffffff",
        padding: "32px 18px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            color: "#e7c36a",
            fontFamily: "Georgia, serif",
            fontSize: "clamp(28px, 4vw, 46px)",
          }}
        >
          Gerador de divulgação AuraMeets
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#d8cddd",
            fontSize: "17px",
          }}
        >
          Adicione seus dados e baixe sua arte pronta para divulgação.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "32px",
            alignItems: "start",
          }}
        >
          <section
            style={{
              padding: "24px",
              border: "1px solid rgba(231, 195, 106, 0.35)",
              borderRadius: "22px",
              background: "rgba(18, 7, 25, 0.86)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            <label style={labelStyle}>
              Sua foto profissional
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={selecionarFoto}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Nome profissional
              <input
                type="text"
                value={nome}
                maxLength={35}
                onChange={(evento) => setNome(evento.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Especialidades
              <textarea
                value={especialidades}
                maxLength={100}
                rows={4}
                onChange={(evento) =>
                  setEspecialidades(evento.target.value)
                }
                placeholder="Digite uma especialidade por linha"
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: "110px",
                }}
              />
            </label>

            <button
              type="button"
              onClick={baixarArte}
              disabled={carregando}
              style={{
                width: "100%",
                border: "none",
                borderRadius: "14px",
                padding: "16px",
                background:
                  "linear-gradient(180deg, #f2d27a 0%, #bf8b27 100%)",
                color: "#241000",
                fontSize: "17px",
                fontWeight: 800,
                cursor: carregando ? "wait" : "pointer",
                opacity: carregando ? 0.65 : 1,
              }}
            >
              {carregando ? "Preparando arte..." : "BAIXAR ARTE EM PNG"}
            </button>
          </section>

          <section>
            <canvas
              ref={canvasRef}
              width={LARGURA}
              height={ALTURA}
              aria-label="Prévia da arte de divulgação"
              style={{
                display: "block",
                width: "100%",
                maxWidth: "430px",
                height: "auto",
                margin: "0 auto",
                borderRadius: "20px",
                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.55)",
                background: "#160920",
              }}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

const labelStyle = {
  display: "grid",
  gap: "9px",
  marginBottom: "20px",
  color: "#f2eaf5",
  fontSize: "16px",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid rgba(231, 195, 106, 0.45)",
  borderRadius: "12px",
  padding: "13px 14px",
  background: "rgba(255, 255, 255, 0.08)",
  color: "#ffffff",
  fontSize: "16px",
  outline: "none",
};