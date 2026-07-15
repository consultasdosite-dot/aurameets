import Chat from "@/components/acolhimento/Chat";

export default function PerguntasPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060B1A] text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center px-5 py-16 sm:px-8">
        <Chat />
      </div>
    </main>
  );
}