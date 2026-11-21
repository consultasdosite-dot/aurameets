import { NextRequest, NextResponse } from "next/server";
import { getRadarAdmin } from "@/lib/radar/server";
import { publicPath, uuidRegex } from "@/lib/radar/validation";
export const runtime = "nodejs";
const LIMIT = 2048;
function reply(status: number, sucesso = false) {
  return NextResponse.json({ sucesso }, { status, headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).origin !== request.nextUrl.origin) return reply(403);
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return reply(415);
    if (Number(request.headers.get("content-length")) > LIMIT) return reply(413);
    // Bound the stream as well as the declared Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return reply(400);
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > LIMIT) { await reader.cancel(); return reply(413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    let input: unknown;
    try { input = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply(400); }
    if (!input || typeof input !== "object" || Array.isArray(input)) return reply(400);
    const { sessao_id, pagina, origem, dispositivo } = input as Record<string, unknown>;
    if (typeof sessao_id !== "string" || !uuidRegex.test(sessao_id) || !publicPath(pagina)) return reply(400);
    const safeOrigin = typeof origem === "string" && origem.length <= 100 && /^[a-zA-Z0-9.-]+$/.test(origem) ? origem : "Direto";
    const safeDevice = dispositivo === "Celular" || dispositivo === "Computador" ? dispositivo : "Desconhecido";
    const db = getRadarAdmin();
    const { data, error: readError } = await db.from("radar_visitantes").select("ultimo_acesso").eq("sessao_id", sessao_id).maybeSingle();
    if (readError) return reply(500);
    const now = Date.now();
    if (data && now - Date.parse(data.ultimo_acesso) >= 0 && now - Date.parse(data.ultimo_acesso) < 10000) return reply(200, true);
    const { error } = await db.from("radar_visitantes").upsert({ sessao_id, pagina, origem: safeOrigin, dispositivo: safeDevice, ultimo_acesso: new Date(now).toISOString() }, { onConflict: "sessao_id" });
    return error ? reply(500) : reply(200, true);
  } catch { return reply(500); }
}
