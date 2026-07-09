"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("As senhas não conferem.");
      return;
    }

    if (password.length < 6) {
      setMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          user_type: "therapist",
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro."
      );
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 shadow-2xl">
        <h1 className="text-center text-4xl font-bold text-white">
          Criar Conta
        </h1>

        <p className="mt-3 text-center text-slate-400">
          Faça parte da AuraMeets
        </p>

        <form onSubmit={handleCadastro} className="mt-8 space-y-5">
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-yellow-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-slate-900 hover:bg-yellow-300"
          >
            {loading ? "Criando conta..." : "Criar minha conta"}
          </button>
        </form>

        {message && (
          <p className="mt-6 rounded-xl bg-slate-800 p-4 text-center text-yellow-400">
            {message}
          </p>
        )}

        <p className="mt-8 text-center text-slate-400">
          Já possui uma conta?
          <Link href="/login" className="ml-2 text-yellow-400 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}