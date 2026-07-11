"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RedefinirSenhaPage() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!ativo) return;

      setSessaoValida(Boolean(session));
      setCarregando(false);
    }

    verificarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, session) => {
      if (!ativo) return;

      if (evento === "PASSWORD_RECOVERY" || session) {
        setSessaoValida(true);
        setCarregando(false);
      }
    });

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");

    if (novaSenha.length < 6) {
      setMensagem("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagem("As senhas não são iguais.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    setSalvando(false);

    if (error) {
      setMensagem(
        "Não foi possível atualizar a senha. Solicite um novo link de recuperação.",
      );
      return;
    }

    setSucesso(true);
    setMensagem("");
    setNovaSenha("");
    setConfirmarSenha("");
  }

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-yellow-400" />

          <p className="mt-5 text-slate-300">
            Validando seu acesso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#111A33] p-6 shadow-2xl sm:p-8">
        <Link
          href="/"
          className="block text-center text-2xl font-black text-yellow-400"
        >
          AuraMeets
        </Link>

        {sucesso ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl font-black text-black">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-black">
              Senha atualizada
            </h1>

            <p className="mt-4 leading-7 text-slate-300">
              Sua nova senha foi cadastrada. Agora você já pode entrar na sua
              conta.
            </p>

            <Link
              href="/login"
              className="mt-8 block rounded-xl bg-yellow-400 px-6 py-4 font-black text-black transition hover:bg-yellow-300"
            >
              Ir para o login
            </Link>
          </div>
        ) : sessaoValida ? (
          <>
            <div className="mt-8 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Segurança da conta
              </p>

              <h1 className="mt-4 text-3xl font-black">
                Crie uma nova senha
              </h1>

              <p className="mt-3 leading-7 text-slate-300">
                Escolha uma senha segura com pelo menos 6 caracteres.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="novaSenha"
                  className="mb-2 block font-bold"
                >
                  Nova senha
                </label>

                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  placeholder="Digite a nova senha"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="mb-2 block font-bold"
                >
                  Confirmar nova senha
                </label>

                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(event) =>
                    setConfirmarSenha(event.target.value)
                  }
                  placeholder="Digite novamente"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400"
                />
              </div>

              {mensagem && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {mensagem}
                </div>
              )}

              <button
                type="submit"
                disabled={salvando}
                className="w-full rounded-xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {salvando ? "Salvando senha..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        ) : (
          <div className="mt-8 text-center">
            <h1 className="text-3xl font-black">
              Link inválido ou expirado
            </h1>

            <p className="mt-4 leading-7 text-slate-300">
              Solicite um novo e-mail de recuperação para redefinir sua senha.
            </p>

            <Link
              href="/login"
              className="mt-8 block rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
            >
              Voltar para o login
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}