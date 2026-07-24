"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginTerapeutaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificandoSessao, setVerificandoSessao] =
    useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace("/dashboard-terapeuta");
        return;
      }

      setVerificandoSessao(false);
    }

    void verificarSessao();
  }, [router]);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !senha) {
      setErro("Informe seu e-mail e sua senha.");
      return;
    }

    setCarregando(true);
    setErro(null);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

    if (error || !data.user) {
      setErro(
        "Não foi possível entrar. Verifique seu e-mail e sua senha.",
      );
      setCarregando(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError || !profile) {
      await supabase.auth.signOut();

      setErro(
        "O perfil desta conta não foi localizado.",
      );
      setCarregando(false);
      return;
    }

    if (profile.user_type !== "therapist") {
      await supabase.auth.signOut();

      setErro(
        "Esta conta não possui acesso ao painel do terapeuta.",
      );
      setCarregando(false);
      return;
    }

    router.replace("/dashboard-terapeuta");
    router.refresh();
  }

  if (verificandoSessao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Verificando acesso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">
            AuraMeets
          </p>

          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            Acesso do terapeuta
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Entre para acessar seu consultório, suas ofertas e
            seus agendamentos.
          </p>
        </div>

        <form
          onSubmit={entrar}
          className="mt-8 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="seuemail@exemplo.com"
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label
                htmlFor="senha"
                className="block text-sm font-semibold text-slate-700"
              >
                Senha
              </label>

              <button
                type="button"
                onClick={() =>
                  router.push("/esqueci-senha")
                }
                className="text-sm font-semibold text-purple-700 hover:text-purple-900"
              >
                Esqueci minha senha
              </button>
            </div>

            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              placeholder="Digite sua senha"
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          {erro && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <p className="text-sm font-medium text-red-700">
                {erro}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="min-h-12 w-full rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {carregando
              ? "Entrando..."
              : "Entrar no painel"}
          </button>
        </form>
      </section>
    </main>
  );
}