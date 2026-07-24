import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Painel do Cliente | AuraMeets",
  description:
    "Acompanhe seus atendimentos, avaliações e recomendações personalizadas no AuraMeets.",
};

type PainelClienteLayoutProps = {
  children: ReactNode;
};

export default function PainelClienteLayout({
  children,
}: PainelClienteLayoutProps) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}