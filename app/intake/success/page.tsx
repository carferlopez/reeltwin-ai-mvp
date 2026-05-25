import { CheckCircle2 } from "lucide-react";

export default function IntakeSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-white">
      <section className="max-w-xl rounded-lg border border-white/10 bg-steel p-8 md:p-12">
        <CheckCircle2 className="h-10 w-10 text-mint" />
        <h1 className="mt-7 font-display text-5xl font-normal leading-none">
          Material recibido.
        </h1>
        <p className="mt-5 leading-7 text-zinc-300">
          El pedido queda en cola de producción. Enviaremos el resultado final al
          email indicado en menos de 24 horas.
        </p>
        <a
          className="mt-9 inline-flex min-h-12 items-center rounded-full bg-signal px-7 font-semibold text-ink"
          href="/"
        >
          Volver
        </a>
      </section>
    </main>
  );
}
