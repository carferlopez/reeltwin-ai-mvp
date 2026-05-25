export type PackageId = "monologo" | "showcase";

export const packages = {
  monologo: {
    id: "monologo",
    name: "El Monólogo",
    price: "29 €",
    numericPrice: 29,
    delivery: "1 clip de 10s",
    tone: "Fondo estándar, voz clonada, entrega 24h",
    stripeEnvKey: "NEXT_PUBLIC_STRIPE_MONOLOGO_LINK"
  },
  showcase: {
    id: "showcase",
    name: "El Showcase",
    price: "79 €",
    numericPrice: 79,
    delivery: "3 clips de 10s",
    tone: "Drama, acción y comedia con fondos hiperrealistas",
    stripeEnvKey: "NEXT_PUBLIC_STRIPE_SHOWCASE_LINK"
  }
} as const;

export function getStripeLink(packageId: PackageId) {
  const envKey = packages[packageId].stripeEnvKey;
  return process.env[envKey] ?? "#pricing";
}
