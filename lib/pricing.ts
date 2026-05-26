export type PlanId = "free" | "pro" | "studio";

export const plans = {
  free: {
    id: "free",
    name: "Free",
    price: "0 €",
    numericPrice: 0,
    period: "mes",
    items: [
      "1 generación al mes",
      "Con marca de agua",
      "Para probar el resultado"
    ],
    cta: "Empezar gratis",
    stripeLink: null
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "19 €",
    numericPrice: 19,
    period: "mes",
    items: [
      "20 generaciones al mes",
      "Sin marca de agua",
      "Alta resolución",
      "Cancela cuando quieras"
    ],
    cta: "Suscribirme",
    stripeEnvKey: "NEXT_PUBLIC_STRIPE_PRO_LINK"
  },
  studio: {
    id: "studio",
    name: "Studio",
    price: "49 €",
    numericPrice: 49,
    period: "mes",
    items: [
      "60 generaciones al mes",
      "Cola prioritaria",
      "Acceso anticipado a nuevos estilos"
    ],
    cta: "Suscribirme",
    stripeEnvKey: "NEXT_PUBLIC_STRIPE_STUDIO_LINK"
  }
} as const;

export function getSubscriptionLink(planId: PlanId): string {
  if (planId === "free") return "#start";
  const plan = plans[planId];
  return process.env[plan.stripeEnvKey] ?? "#pricing";
}
