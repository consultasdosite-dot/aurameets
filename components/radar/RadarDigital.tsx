"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { publicPath } from "@/lib/radar/validation";
export default function RadarDigital() {
  const pathname = usePathname();
  useEffect(() => {
    if (!publicPath(pathname)) return;
    let sending = false;
    let disposed = false;
    const controller = new AbortController();
    async function register() {
      if (disposed || sending || document.visibilityState !== "visible") return;
      try {
        const preferences = JSON.parse(localStorage.getItem("aurameets_cookie_preferences") || "null");
        if (preferences?.analytics !== true) { sessionStorage.removeItem("aurameets_radar_sessao"); return; }
        let session = sessionStorage.getItem("aurameets_radar_sessao");
        if (!session) { session = crypto.randomUUID(); sessionStorage.setItem("aurameets_radar_sessao", session); }
        let source = sessionStorage.getItem("aurameets_radar_origem");
        if (!source) {
          source = document.referrer ? new URL(document.referrer).hostname : "Direto";
          if (source === location.hostname) source = "Direto";
          sessionStorage.setItem("aurameets_radar_origem", source);
        }
        sending = true;
        await fetch("/api/radar", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
          body: JSON.stringify({ sessao_id: session, pagina: pathname, origem: source, dispositivo: /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent) ? "Celular" : "Computador" }) });
      } catch { /* O Radar não interfere na navegação. */ }
      finally { sending = false; }
    }
    void register();
    const interval = window.setInterval(() => void register(), 30000);
    const onChange = () => void register();
    document.addEventListener("visibilitychange", onChange);
    window.addEventListener("aurameets-cookie-consent", onChange);
    window.addEventListener("storage", onChange);
    return () => { disposed = true; controller.abort(); window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onChange);
      window.removeEventListener("aurameets-cookie-consent", onChange);
      window.removeEventListener("storage", onChange); };
  }, [pathname]);
  return null;
}
