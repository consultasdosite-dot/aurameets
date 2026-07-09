"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [nome, setNome] = useState("Terapeuta");

  useEffect(() => {
    async function carregarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.name) {
        setNome(user.user_metadata.name);
      } else if (user?.email) {
        setNome(user.email.split("@")[0]);
      }
    }

    carregarUsuario();
  }, []);

  return (
    <>
      <Sidebar />

      <main className="min-h-screen bg-slate-950 p-10 text-white md:ml-72">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">Olá, {nome} 👋</h1>

          <p className="mt-2 text-slate-400">
            Bem-vindo ao painel do terapeuta AuraMeets.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-900 p-6">
              <p className="text-slate-400">Plano atual</p>
              <h2 className="mt-2 text-2xl font-bold text-yellow-400">
                Gratuito
              </h2>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <p className="text-slate-400">Perfil completo</p>
              <h2 className="mt-2 text-2xl font-bold">35%</h2>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <p className="text-slate-400">Visualizações</p>
              <h2 className="mt-2 text-2xl font-bold">0</h2>
            </div>

            <div className="rounded-2xl bg-slate-900 p-6">
              <p className="text-slate-400">Mensagens</p>
              <h2 className="mt-2 text-2xl font-bold">0</h2>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-slate-900 p-8">
            <h2 className="text-2xl font-bold text-yellow-400">
              Complete seu perfil
            </h2>

            <p className="mt-3 text-slate-400">
              Quanto mais completo estiver seu perfil, maiores as chances de ser
              encontrado pelos clientes.
            </p>

            <div className="mt-6 h-4 rounded-full bg-slate-800">
              <div className="h-4 w-[35%] rounded-full bg-yellow-400" />
            </div>

            <a
              href="/terapeuta/editar"
              className="mt-6 inline-block rounded-xl bg-yellow-400 px-6 py-4 font-bold text-slate-950 hover:bg-yellow-300"
            >
              Editar meu perfil
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              "Agenda",
              "Clientes",
              "Mensagens",
              "Financeiro",
              "Avaliações",
              "Cursos",
              "Eventos",
              "Meu Perfil",
              "Configurações",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-slate-900 p-6 font-bold transition hover:bg-slate-800"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}