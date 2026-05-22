import { ArrowDown, Clock, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";

const process = [
  "Pagas el pack con Stripe.",
  "Subes 1 minuto de video base.",
  "Escribes el guion o escena.",
  "Recibes el clip por email en 24h."
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="min-h-[92vh] border-b-2 border-white px-5 py-5 md:px-8">
        <nav className="flex items-center justify-between border-2 border-white bg-ink px-4 py-3 font-mono text-xs uppercase">
          <span className="font-black text-signal">ReelTwin.ai</span>
          <a className="text-zinc-200 hover:text-signal" href="#pricing">
            Packs
          </a>
        </nav>

        <div className="grid min-h-[calc(92vh-74px)] gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="inline-flex border border-signal px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] text-signal">
              Clip cinematografico. 10 segundos. 24 horas.
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black uppercase leading-[0.9] md:text-7xl lg:text-8xl">
              Tu gemelo digital en un reel que parece de rodaje.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-7 text-zinc-200 md:text-xl">
              Para actores noveles y micro-influencers que necesitan una prueba
              visual potente sin alquilar estudio, equipo ni media semana de produccion.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="flex min-h-16 items-center justify-center gap-2 border-2 border-signal bg-signal px-7 text-lg font-black uppercase text-ink transition hover:bg-ink hover:text-signal"
                href="#pricing"
              >
                Ver precios
                <ArrowDown className="h-5 w-5" />
              </a>
              <a
                className="flex min-h-16 items-center justify-center border-2 border-white px-7 text-lg font-black uppercase transition hover:border-mint hover:text-mint"
                href="#demo"
              >
                Ver demo
              </a>
            </div>
          </div>

          <div id="demo" className="scanline border-2 border-white bg-steel p-3 shadow-hard">
            <div className="relative aspect-video overflow-hidden border-2 border-white bg-ink">
              <img
                alt="Demo visual de transformacion antes y despues de ReelTwin.ai"
                className="h-full w-full object-cover"
                src="/reeltwin-demo.png"
              />
              <div className="absolute inset-x-0 top-0 flex justify-between p-4 font-mono text-xs uppercase">
                <span className="bg-ink/85 px-2 py-1 text-zinc-200">Antes</span>
                <span className="bg-signal px-2 py-1 text-ink">Despues</span>
              </div>
              <div className="absolute bottom-4 left-4 border border-signal bg-ink/85 px-3 py-2 font-mono text-xs uppercase text-signal">
                1 minuto base a clip cinematico
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-white px-5 py-14 md:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {process.map((step, index) => (
            <div key={step} className="border-2 border-white bg-steel p-5">
              <p className="font-mono text-xs uppercase text-signal">
                0{index + 1}
              </p>
              <p className="mt-8 text-xl font-black uppercase leading-tight">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-b-2 border-white px-5 py-16 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
              Pay per use
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Dos decisiones. Cero suscripcion.
            </h2>
          </div>
          <p className="max-w-lg text-zinc-300">
            Oferta polar para validar demanda real desde el primer pago. El usuario
            compra, sube material y recibe resultado.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <PricingCard packageId="monologo" />
          <PricingCard packageId="showcase" featured />
        </div>
      </section>

      <section className="grid gap-4 px-5 py-14 md:grid-cols-3 md:px-8">
        <div className="border-2 border-white bg-steel p-5">
          <ShieldCheck className="h-7 w-7 text-mint" />
          <h3 className="mt-5 text-xl font-black uppercase">Pago verificado</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Webhook de Stripe con firma obligatoria antes de registrar pedidos.
          </p>
        </div>
        <div className="border-2 border-white bg-steel p-5">
          <LockKeyhole className="h-7 w-7 text-mint" />
          <h3 className="mt-5 text-xl font-black uppercase">Datos cerrados</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            PostgreSQL con RLS y almacenamiento privado para videos base.
          </p>
        </div>
        <div className="border-2 border-white bg-steel p-5">
          <Clock className="h-7 w-7 text-mint" />
          <h3 className="mt-5 text-xl font-black uppercase">Custodia limitada</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Script de purga para eliminar videos de entrenamiento tras 7 dias.
          </p>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t-2 border-white px-5 py-6 font-mono text-xs uppercase text-zinc-400 md:flex-row md:items-center md:justify-between md:px-8">
        <span>ReelTwin.ai MVP</span>
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-signal" />
          Excelente en lo minimo indispensable
        </span>
      </footer>
    </main>
  );
}
