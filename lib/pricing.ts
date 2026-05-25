export type PackageId = "foto" | "monologo" | "showcase";

export const packages = {
  foto: {
    id: "foto",
    name: "Sesión Foto",
    price: "49 €",
    numericPrice: 49,
    delivery: "3 imágenes editoriales",
    items: [
      "Generado desde tu producto, render o foto base",
      "Cualquier escenario, textura o ambiente",
      "Archivos en alta resolución listos para publicar"
    ],
    cta: "Solicitar",
    stripeEnvKey: "NEXT_PUBLIC_STRIPE_FOTO_LINK"
  },
  monologo: {
    id: "monologo",
    name: "El Monólogo",
    price: "29 €",
    numericPrice: 29,
    delivery: "1 clip de vídeo 10s",
    items: [
      "Gemelo digital generado desde tu vídeo base",
      "Fondo cinematográfico y voz clonada",
      "Clip final enviado por email en 24h"
    ],
    cta: "Elegir pack",
    stripeEnvKey: "NEXT_PUBLIC_STRIPE_MONOLOGO_LINK"
  },
  showcase: {
    id: "showcase",
    name: "El Showcase",
    price: "79 €",
    numericPrice: 79,
    delivery: "3 clips de vídeo 10s",
    items: [
      "Gemelo digital generado desde tu vídeo base",
      "Drama, acción y comedia con fondos hiperrealistas",
      "3 clips distintos enviados por email en 24h"
    ],
    cta: "Elegir pack",
    stripeEnvKey: "NEXT_PUBLIC_STRIPE_SHOWCASE_LINK"
  }
} as const;

export function getStripeLink(packageId: PackageId) {
  const pkg = packages[packageId];
  if (packageId === "foto") return "#pricing";
  return process.env[pkg.stripeEnvKey] ?? "#pricing";
}
