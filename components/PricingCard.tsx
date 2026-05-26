import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getSubscriptionLink, plans, type PlanId } from "@/lib/pricing";

type PricingCardProps = {
  planId: PlanId;
  featured?: boolean;
};

export function PricingCard({ planId, featured = false }: PricingCardProps) {
  const plan = plans[planId];

  return (
    <article className={`pricing-card${featured ? " pricing-card--featured" : ""}`}>
      {featured && <span className="pricing-badge">Más popular</span>}
      <h3>{plan.name}</h3>
      <p className="pricing-price">
        {plan.price}<span>/{plan.period}</span>
      </p>
      <ul>
        {plan.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Link
        className={featured ? "cta-primary" : "cta-secondary"}
        href={getSubscriptionLink(planId)}
      >
        {plan.cta}
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}
