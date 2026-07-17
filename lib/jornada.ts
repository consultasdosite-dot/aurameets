export interface JornadaAuraMeets {
  motivo?: string;
  area?: string;
  tempo?: string;
  impacto?: string;
  emocao?: string;
  objetivo?: string;
  apoioAnterior?: string;
  perfilTerapeutico?: string;
  formatoAtendimento?: string;
  preferenciaGenero?: string;
  falaLivre?: string;
}

const CHAVE = "aurameets_jornada";

export function obterJornada(): JornadaAuraMeets {
  if (typeof window === "undefined") {
    return {};
  }

  const dados = localStorage.getItem(CHAVE);

  if (!dados) {
    return {};
  }

  try {
    return JSON.parse(dados) as JornadaAuraMeets;
  } catch {
    return {};
  }
}

export function salvarResposta(
  campo: keyof JornadaAuraMeets,
  valor: string
) {
  const jornada = obterJornada();

  jornada[campo] = valor;

  localStorage.setItem(CHAVE, JSON.stringify(jornada));
}

export function limparJornada() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CHAVE);
}