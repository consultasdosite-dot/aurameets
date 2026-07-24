type DashboardHeaderProps = {
  therapistName?: string;
};

export default function DashboardHeader({
  therapistName,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-2">
      <h1 className="text-4xl font-bold text-white">
        Olá, {therapistName || "Terapeuta"} 👋
      </h1>

      <p className="text-slate-400">
        Bem-vindo ao seu painel do AuraMeets.
      </p>
    </header>
  );
}