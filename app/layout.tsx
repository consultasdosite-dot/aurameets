import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AuraMeets",
  description:
    "Encontre terapeutas compatíveis com o seu momento e suas necessidades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappUrl =
    "https://wa.me/5551980339532?text=" +
    encodeURIComponent(
      "Olá! Vim pelo site AuraMeets e gostaria de mais informações."
    );

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-full flex-col"
      >
        <ServiceWorkerRegister />

        {children}

        <CookieConsent />

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fale com a AuraMeets pelo WhatsApp"
          className="fixed bottom-5 right-4 z-[100] flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-2xl transition hover:scale-105 hover:bg-[#20bd5a] sm:bottom-6 sm:right-6 sm:px-5"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="h-6 w-6 shrink-0 fill-current"
          >
            <path d="M19.11 17.21c-.26-.13-1.53-.75-1.77-.84-.24-.09-.41-.13-.59.13-.17.26-.68.84-.83 1.01-.15.17-.3.2-.56.07-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.53-1.44-1.79-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.59-1.42-.81-1.94-.21-.51-.43-.44-.59-.45h-.5c-.17 0-.46.07-.7.33-.24.26-.92.9-.92 2.2 0 1.29.94 2.54 1.07 2.72.13.17 1.85 2.82 4.48 3.96.63.27 1.11.43 1.49.55.63.2 1.2.17 1.65.1.5-.07 1.53-.63 1.75-1.23.22-.61.22-1.12.15-1.23-.06-.11-.24-.17-.5-.3Z" />
            <path d="M16.03 3.2c-7.05 0-12.79 5.74-12.79 12.79 0 2.25.59 4.45 1.7 6.39L3.13 29l6.78-1.78a12.75 12.75 0 0 0 6.12 1.56h.01c7.05 0 12.79-5.74 12.79-12.79S23.08 3.2 16.03 3.2Zm0 23.42h-.01a10.6 10.6 0 0 1-5.41-1.48l-.39-.23-4.02 1.05 1.07-3.92-.25-.4a10.58 10.58 0 0 1-1.63-5.65c0-5.87 4.78-10.64 10.65-10.64 5.87 0 10.64 4.78 10.64 10.64 0 5.87-4.78 10.63-10.65 10.63Z" />
          </svg>

          <span>FALE COM ATENDENTE</span>
        </a>
      </body>
    </html>
  );
}
