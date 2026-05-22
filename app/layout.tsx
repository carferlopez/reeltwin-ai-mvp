import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReelTwin.ai | Gemelos digitales para clips cinematograficos",
  description:
    "Genera un clip cinematografico de 10 segundos con tu gemelo digital, voz clonada y entrega en 24 horas.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
