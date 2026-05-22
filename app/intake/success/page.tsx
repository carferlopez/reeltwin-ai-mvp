import { CheckCircle2 } from "lucide-react";

export default function IntakeSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-white">
      <section className="max-w-xl border-2 border-white bg-steel p-6 shadow-hard">
        <CheckCircle2 className="h-10 w-10 text-mint" />
        <h1 className="mt-6 text-4xl font-black uppercase leading-none">
          Material recibido.
        </h1>
        <p className="mt-5 leading-7 text-zinc-300">
          El pedido queda en cola de produccion. Enviaremos el resultado final al
          email indicado en menos de 24 horas.
        </p>
        <a
          className="mt-8 inline-flex min-h-12 items-center border-2 border-signal bg-signal px-5 font-black uppercase text-ink"
          href="/"
        >
          Volver
        </a>
      </section>
    </main>
  );
}
