"use client";

import Link from "next/link";

export default function HomeTeste() {
  return (
    <main className="entrada">
      <div className="imagem">
        <img
          src="/hero-aura-maos-limpa.png"
          alt="Duas mãos se aproximando em um gesto de acolhimento"
        />
      </div>

      <section className="conteudo">
        <img
          className="logo"
          src="/logo-aurameets-home3.png"
          alt="AuraMeets"
        />

        <p className="chamada">Um espaço para acolher você</p>

        <h1>Como podemos ajudar você?</h1>

        <p className="orientacao">
          Escolha por onde quer começar.
        </p>

        <div className="botoes">
          <Link href="/teste/atendimento" className="principal">
            Preciso de atendimento
          </Link>

          <Link href="/teste/terapeutas" className="secundario">
            Sou terapeuta
          </Link>
        </div>
      </section>

      <style jsx>{`
        .entrada {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          min-height: 100svh;
          background: #fcfaff;
          color: #291738;
          font-family: Arial, Helvetica, sans-serif;
        }

        .imagem {
          min-height: 100svh;
          position: relative;
        }

        .imagem img {
          position: absolute;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .conteudo {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px clamp(24px, 5vw, 80px);
        }

        .logo {
          width: 250px;
          max-width: 85%;
          height: auto;
          margin-bottom: 36px;
        }

        .chamada {
          color: #652d91;
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 18px;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: clamp(36px, 4vw, 60px);
          font-weight: normal;
          line-height: 1.12;
          margin: 0 0 20px;
        }

        .orientacao {
          color: #6a5e74;
          font-size: 18px;
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .botoes {
          display: grid;
          gap: 16px;
        }

        .botoes :global(a) {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 62px;
          padding: 16px 20px;
          border-radius: 14px;
          text-align: center;
          text-decoration: none;
          font-size: 18px;
          font-weight: bold;
          border: 2px solid transparent;
        }

        .botoes :global(.principal) {
          background: #572383;
          color: white;
        }

        .botoes :global(.principal:hover) {
          background: #401962;
        }

        .botoes :global(.secundario) {
          background: white;
          color: #572383;
          border-color: #d4bce8;
        }

        .botoes :global(.secundario:hover) {
          background: #f0e6f8;
        }

        .botoes :global(a:focus-visible) {
          outline: 3px solid #a268d0;
          outline-offset: 5px;
        }

        @media (max-width: 760px) {
          .entrada {
            display: flex;
            flex-direction: column;
          }

          .imagem {
            min-height: 0;
            height: 34svh;
            max-height: 320px;
          }

          .conteudo {
            padding: 24px 24px 40px;
          }

          .logo {
            width: 190px;
            margin-bottom: 24px;
          }

          h1 {
            font-size: 38px;
          }

          .orientacao {
            margin-bottom: 24px;
          }
        }
      `}</style>
    </main>
  );
}