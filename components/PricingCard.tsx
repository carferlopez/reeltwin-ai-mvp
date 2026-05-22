import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { getStripeLink, packages, type PackageId } from "@/lib/pricing";

type PricingCardProps = {
  packageId: PackageId;
  featured?: boolean;
};

export function PricingCard({ packageId, featured = false }: PricingCardProps) {
  const pack = packages[packageId];

  return (
    <article className="border-2 border-white bg-steel p-5 shadow-hard">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
            Pack
          </p>
          <h3 className="mt-2 text-2xl font-black uppercase leading-none">
            {pack.name}
          </h3>
        </div>
        {featured ? (
          <span className="border border-signal px-2 py-1 font-mono text-[11px] uppercase text-signal">
            Mejor test
          </span>
        ) : null}
      </div>

      <p className="mt-8 text-6xl font-black leading-none">{pack.price}</p>
      <p className="mt-3 font-mono text-sm uppercase text-zinc-300">
        {pack.delivery}
      </p>

      <ul className="mt-8 space-y-3 text-sm text-zinc-200">
        <li className="flex gap-3">
          <Check className="mt-0.5 h-4 w-4 flex-none text-mint" />
          Gemelo digital entrenado desde tu video base.
        </li>
        <li className="flex gap-3">
          <Check className="mt-0.5 h-4 w-4 flex-none text-mint" />
          {pack.tone}.
        </li>
        <li className="flex gap-3">
          <Check className="mt-0.5 h-4 w-4 flex-none text-mint" />
          Resultado enviado por email en menos de 24h.
        </li>
      </ul>

      <Link
        className="mt-8 flex min-h-14 w-full items-center justify-center gap-2 border-2 border-signal bg-signal px-5 text-center text-base font-black uppercase text-ink transition hover:bg-ink hover:text-signal"
        href={getStripeLink(packageId)}
      >
        Pagar ahora
        <ArrowUpRight className="h-5 w-5" />
      </Link>
    </article>
  );
}
