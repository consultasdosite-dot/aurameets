import { NextRequest, NextResponse } from "next/server";
import { getRadarAdmin, radarAdminIds } from "@/lib/radar/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function reply(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", Vary: "Authorization" } });
}
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) return reply({ error: "Entre com sua conta administrativa." }, 401);
    const db = getRadarAdmin();
    const { data: { user }, error } = await db.auth.getUser(token);
    if (error || !user) return reply({ error: "Sessão inválida. Entre novamente." }, 401);
    if (!radarAdminIds.includes(user.id)) return reply({ error: "Acesso exclusivo do administrador." }, 403);
    const cutoff = new Date(Date.now() - 90000).toISOString();
    const { data, count, error: queryError } = await db.from("radar_visitantes")
      .select("id,pagina,origem,dispositivo,primeiro_acesso,ultimo_acesso", { count: "exact" })
      .gte("ultimo_acesso", cutoff).order("ultimo_acesso", { ascending: false }).limit(100);
    if (queryError) return reply({ error: "Não foi possível consultar o Radar." }, 500);
    return reply({ visitantes: data, online: count || 0, atualizado_em: new Date().toISOString() });
  } catch { return reply({ error: "Radar indisponível. Confira a configuração." }, 500); }
}
