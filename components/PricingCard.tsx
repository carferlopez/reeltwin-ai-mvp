import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { getStripeLink, packages, type PackageId } from "@/lib/pricing";

type PricingCardProps = {
  packageId: PackageId;
  featured?: boolean;
};

export function PricingCard({ packageId, featured = false }: PricingCardProps) {
  const pack = packages[packageId];

  return (
    <article className={`price-card${featured ? " featured" : ""}`}>
      <div className="price-top">
        <div>
          <span className="price-label">Pack</span>
          <h3>{pack.name}</h3>
        </div>
        {featured ? <span className="recommendation">Más completo</span> : null}
      </div>

      <p className="amount">{pack.price}</p>
      <p className="delivery">{pack.delivery}</p>

      <ul>
        {pack.items.map((item) => (
          <li key={item}>
            <Check />
            {item}
          </li>
        ))}
      </ul>

      <Link className="price-button" href={getStripeLink(packageId)}>
        {pack.cta}
        <ArrowRight />
      </Link>
    </article>
  );
}
