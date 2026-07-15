"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviandoRecuperacao, setEnviandoRecuperacao] =
    useState(false);
  const [message, setMessage] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState<
    "erro" | "sucesso"
  >("erro");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setTipoMensagem("erro");
    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (error || !data.user) {
      setMessage("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .single();

    setLoading(false);

    if (profileError || !profile) {
      setMessage(
        "Sua conta existe, mas o perfil não foi localizado.",
      );
      return;
    }

    if (profile.user_type === "admin") {
      router.push("/admin");
      router.refresh();
      return;
    }

    if (profile.user_type === "therapist") {
      router.push("/dashboard-terapeuta");
      router.refresh();
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleRecuperarSenha() {
    setMessage("");
    setTipoMensagem("erro");

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado) {
      setMessage(
        "Digite seu e-mail acima antes de solicitar a recuperação.",
      );
      return;
    }

    setEnviandoRecuperacao(true);

    const redirectTo = `${window.location.origin}/redefinir-senha`;

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        emailNormalizado,
        {
          redirectTo,
        },
      );

    setEnviandoRecuperacao(false);

    if (error) {
      console.error(
        "Erro ao enviar recuperação de senha:",
        error,
      );

      setMessage(
        "Não foi possível enviar o e-mail de recuperação. Tente novamente.",
      );
      return;
    }

    setTipoMensagem("sucesso");
    setMessage(
      "E-mail enviado. Abra somente a mensagem mais recente para criar sua nova senha.",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-center text-4xl font-bold text-white">
          Entrar
        </h1>

        <p className="mt-3 text-center text-slate-400">
          Acesse sua conta AuraMeets
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-400"
          />

          <button
            type="submit"
            disabled={loading || enviandoRecuperacao}
            className="w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-slate-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleRecuperarSenha}
          disabled={loading || enviandoRecuperacao}
          className="mt-5 w-full text-center font-semibold text-yellow-400 transition hover:text-yellow-300 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviandoRecuperacao
            ? "Enviando recuperação..."
            : "Esqueci minha senha"}
        </button>

        {message && (
          <p
            role="alert"
            className={`mt-6 rounded-xl border p-4 text-center ${
              tipoMensagem === "sucesso"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-yellow-400/30 bg-slate-800 text-yellow-400"
            }`}
          >
            {message}
          </p>
        )}

        <p className="mt-8 text-center text-slate-400">
          Ainda não tem conta?
          <Link
            href="/cadastro"
            className="ml-2 text-yellow-400 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}