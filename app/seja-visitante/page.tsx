export default function SejaVisitantePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#06101f",
        padding: "40px 24px",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "768px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
            color: "#facc15",
          }}
        >
          AuraMeets
        </p>

        <h1
          style={{
            marginTop: "24px",
            marginBottom: 0,
            fontSize: "clamp(36px, 6vw, 56px)",
            lineHeight: 1.1,
            fontWeight: 900,
          }}
        >
          Encontre o terapeuta ideal para o seu momento
        </h1>

        <p
          style={{
            marginTop: "24px",
            marginBottom: 0,
            fontSize: "18px",
            lineHeight: 1.7,
            color: "#cbd5e1",
          }}
        >
          Responda algumas perguntas rápidas e receba uma orientação inicial
          para encontrar terapeutas mais compatíveis com a sua necessidade.
        </p>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <a
            href="/jornada/pergunta-1"
            style={{
              display: "inline-flex",
              minHeight: "56px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9999px",
              backgroundColor: "#facc15",
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: 800,
              color: "#06101f",
              textDecoration: "none",
              border: "3px solid #ffffff",
              boxShadow: "0 12px 30px rgba(250, 204, 21, 0.3)",
              cursor: "pointer",
            }}
          >
            Iniciar minha jornada
          </a>
        </div>
      </div>
    </main>
  );
}