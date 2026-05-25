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
  title: "ReelTwin.ai | Producción de video con IA para empresas",
  description:
    "Producimos clips con el gemelo digital de tu portavoz, guiados por dirección creativa. Brief, producción y entrega. Sin estudio, sin agenda.",
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
