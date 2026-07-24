"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type TipoMensagem = "erro" | "sucesso";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [loading, setLoading] = useState(false);
  const [enviandoRecuperacao, setEnviandoRecuperacao] =
    useState(false);

  const [message, setMessage] = useState("");
  const [tipoMensagem, setTipoMensagem] =
    useState<TipoMensagem>("erro");

  function limparMensagem() {
    setMessage("");
    setTipoMensagem("erro");
  }

  async function handleLogin(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    limparMensagem();

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !password) {
      setMessage("Preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password,
      });

    if (error || !data.user) {
      console.error("Erro ao entrar:", error);

      setMessage(
        "E-mail ou senha inválidos. Verifique os dados e tente novamente.",
      );

      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Erro ao localizar o perfil:",
        profileError,
      );

      await supabase.auth.signOut();

      setMessage(
        "Não foi possível identificar o tipo da sua conta.",
      );

      setLoading(false);
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();

      setMessage(
        "Sua conta foi autenticada, mas o perfil ainda não foi localizado.",
      );

      setLoading(false);
      return;
    }

    if (profile.user_type === "admin") {
      router.replace("/admin");
      router.refresh();
      return;
    }

    if (profile.user_type === "therapist") {
      router.replace("/dashboard-terapeuta");
      router.refresh();
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function handleRecuperarSenha() {
    limparMensagem();

    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado) {
      setMessage(
        "Digite seu e-mail no campo acima antes de solicitar a recuperação.",
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
      "Enviamos as instruções de recuperação. Abra a mensagem mais recente recebida no seu e-mail.",
    );
  }

  const formularioBloqueado =
    loading || enviandoRecuperacao;

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-slate-950">
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-purple-700/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-40 -right-24 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-3xl"
      />

      <section className="relative hidden min-h-screen w-[48%] flex-col justify-between border-r border-white/10 px-12 py-10 lg:flex xl:px-20">
        <Link
          href="/"
          className="flex w-fit items-center gap-3"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-500 text-sm font-black text-white shadow-xl shadow-purple-950/50">
            AM
          </span>

          <span>
            <span className="block text-xl font-bold tracking-tight text-white">
              AuraMeets
            </span>

            <span className="block text-xs text-slate-400">
              Conexões que transformam
            </span>
          </span>
        </Link>

        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-purple-300">
            Sua jornada começa aqui
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight text-white xl:text-6xl">
            Um espaço profissional para cuidar, conectar e evoluir.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Acesse sua conta para administrar seu perfil,
            acompanhar solicitações e construir sua presença
            profissional no AuraMeets.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                numero: "01",
                texto: "Perfil profissional",
              },
              {
                numero: "02",
                texto: "Agenda e clientes",
              },
              {
                numero: "03",
                texto: "Comunidade AuraMeets",
              },
            ].map((item) => (
              <div
                key={item.numero}
                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur"
              >
                <p className="text-xs font-bold text-purple-300">
                  {item.numero}
                </p>

                <p className="mt-2 text-sm font-semibold leading-5 text-white">
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          AuraMeets © 2026
        </p>
      </section>

      <section className="relative flex min-h-screen flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mx-auto mb-10 flex w-fit items-center gap-3 lg:hidden"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 via-violet-500 to-fuchsia-500 text-sm font-black text-white shadow-xl shadow-purple-950/50">
              AM
            </span>

            <span>
              <span className="block text-xl font-bold text-white">
                AuraMeets
              </span>

              <span className="block text-xs text-slate-400">
                Conexões que transformam
              </span>
            </span>
          </Link>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-9">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-300">
                Bem-vindo
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                Acesse sua conta
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Utilize o e-mail cadastrado no AuraMeets.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    limparMensagem();
                  }}
                  autoComplete="email"
                  required
                  disabled={formularioBloqueado}
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-200"
                  >
                    Senha
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      void handleRecuperarSenha()
                    }
                    disabled={formularioBloqueado}
                    className="text-xs font-semibold text-purple-300 transition hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enviandoRecuperacao
                      ? "Enviando..."
                      : "Esqueci minha senha"}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={
                      mostrarSenha ? "text" : "password"
                    }
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      limparMensagem();
                    }}
                    autoComplete="current-password"
                    required
                    disabled={formularioBloqueado}
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-20 text-white outline-none transition placeholder:text-slate-600 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha(
                        (estadoAtual) => !estadoAtual,
                      )
                    }
                    disabled={formularioBloqueado}
                    className="absolute inset-y-0 right-4 text-xs font-semibold text-slate-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {mostrarSenha ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={formularioBloqueado}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/40 transition hover:from-purple-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar no AuraMeets"}
              </button>
            </form>

            {message && (
              <div
                role="alert"
                className={`mt-6 rounded-2xl border p-4 ${
                  tipoMensagem === "sucesso"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-amber-400/30 bg-amber-400/10 text-amber-200"
                }`}
              >
                <p className="text-sm leading-6">
                  {message}
                </p>
              </div>
            )}

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-center text-sm text-slate-400">
                Ainda não possui uma conta?
              </p>

              <Link
                href="/cadastro-fundador"
                className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-purple-400/30 bg-purple-400/10 px-5 py-3 text-sm font-semibold text-purple-200 transition hover:border-purple-300/50 hover:bg-purple-400/15 hover:text-white"
              >
                Criar perfil de terapeuta
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-600">
            Ao acessar, você concorda com os termos e com a
            política de privacidade do AuraMeets.
          </p>
        </div>
      </section>
    </main>
  );
}