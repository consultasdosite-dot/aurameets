"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setEnviado(false);

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      },
    );

    setCarregando(false);

    if (error) {
      setErro("Não foi possível enviar o e-mail de recuperação.");
      return;
    }

    setEnviado(true);
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

        {enviado ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-3xl font-black text-black">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-black">
              Confira seu e-mail
            </h1>

            <p className="mt-4 leading-7 text-slate-300">
              Enviamos um link de recuperação para:
            </p>

            <p className="mt-2 break-all font-bold text-yellow-400">
              {email}
            </p>

            <p className="mt-4 leading-7 text-slate-400">
              Abra o e-mail e clique no link para cadastrar uma nova senha.
            </p>

            <Link
              href="/login"
              className="mt-8 block rounded-xl border border-yellow-400 px-6 py-4 font-black text-yellow-400 transition hover:bg-yellow-400 hover:text-black"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 text-center">
              <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
                Recuperação de acesso
              </p>

              <h1 className="mt-4 text-3xl font-black">
                Esqueceu sua senha?
              </h1>

              <p className="mt-3 leading-7 text-slate-300">
                Informe o e-mail da sua conta para receber o link de
                recuperação.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block font-bold">
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-[#080D22] px-5 py-4 outline-none transition placeholder:text-slate-500 focus:border-yellow-400"
                />
              </div>

              {erro && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300"
                >
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-xl bg-yellow-400 px-6 py-4 text-lg font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando
                  ? "Enviando..."
                  : "Enviar link de recuperação"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-6 block text-center font-bold text-yellow-400 hover:underline"
            >
              Voltar para o login
            </Link>
          </>
        )}
      </section>
    </main>
  );
}