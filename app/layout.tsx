import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400"
});

export const metadata: Metadata = {
  title: "ReelTwin.ai | Imagen y video con IA para empresas",
  description:
    "Producimos imagen y video con IA para inmobiliarias, tiendas online y formación corporativa. Sin fotógrafo, sin estudio, sin esperar agenda.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${manrope.variable} ${instrumentSerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
