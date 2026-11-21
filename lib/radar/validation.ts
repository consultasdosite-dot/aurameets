export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function publicPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 250 || !value.startsWith("/") || value.startsWith("//") || /[?#\\\u0000-\u001f\u007f]/.test(value)) return false;
  try {
    const decoded = decodeURIComponent(value);
    if (/[?#%\\\u0000-\u001f\u007f]/.test(decoded) || decoded.startsWith("//")) return false;
    if (new URL(value, "https://radar.invalid").pathname !== value) return false;
    return !/^\/(admin|api|dashboard|dashboard-terapeuta|painel-cliente|login|login-terapeuta|redefinir-senha|cadastro|cadastro-fundador|cadastro-convidado|perfil-teste)(\/|$)/i.test(decoded);
  } catch { return false; }
}
