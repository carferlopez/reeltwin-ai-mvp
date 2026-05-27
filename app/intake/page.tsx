import { Suspense } from "react";
import Link from "next/link";
import { ReelForm } from "@/components/ReelForm";

export default async function IntakePage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; order?: string }>;
}) {
  const params = await searchParams;
  const orderReference = params.session_id ?? params.order ?? "";

  return (
    <main className="min-h-screen bg-ink px-5 py-8 text-white md:px-8 md:py-12">
      <div className="mx-auto max-w-2xl">
        <Link className="text-xl font-bold" href="/">
          ReelTwin<span className="text-signal">.ai</span>
        </Link>
        <p className="mt-16 text-xs font-bold uppercase tracking-[0.16em] text-signal">
          Material de producción
        </p>
        <h1 className="mt-5 font-display text-5xl font-normal leading-none md:text-7xl">
          Sube tu vídeo y guion.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">
          Tu material se almacena de forma privada y se elimina al finalizar el
          plazo de custodia tras la entrega.
        </p>

        <div className="mt-12">
          <Suspense fallback={<div className="h-64 w-full animate-pulse bg-zinc/20 rounded-2xl" />}>
            <ReelForm initialOrderReference={orderReference} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
