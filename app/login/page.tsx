"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
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

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-slate-900 hover:bg-yellow-300"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {message && (
          <p className="mt-6 rounded-xl bg-slate-800 p-4 text-center text-yellow-400">
            {message}
          </p>
        )}

        <p className="mt-8 text-center text-slate-400">
          Ainda não tem conta?
          <Link href="/cadastro" className="ml-2 text-yellow-400 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}