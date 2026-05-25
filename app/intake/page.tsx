import { Upload } from "lucide-react";

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
        <a className="text-xl font-bold" href="/">
          ReelTwin<span className="text-signal">.ai</span>
        </a>
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

        <form
          action="/api/intake"
          className="mt-12 space-y-7 rounded-lg border border-white/10 bg-steel p-6 md:p-9"
          encType="multipart/form-data"
          method="post"
        >
          <input name="order_reference" type="hidden" value={orderReference} />
          <label className="block">
            <span className="text-sm font-semibold text-zinc-200">Email</span>
            <input
              className="mt-3 min-h-14 w-full rounded-md border border-white/15 bg-ink px-4 text-white outline-none transition focus:border-signal"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-zinc-200">
              Vídeo base
            </span>
            <input
              accept="video/mp4,video/quicktime,video/webm"
              className="mt-3 w-full rounded-md border border-white/15 bg-ink p-4 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-signal file:px-5 file:py-2 file:font-semibold file:text-ink"
              name="training_video"
              required
              type="file"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-zinc-200">Guion</span>
            <textarea
              className="mt-3 min-h-40 w-full rounded-md border border-white/15 bg-ink p-4 text-white outline-none transition focus:border-signal"
              maxLength={1200}
              name="script"
              placeholder="Escena, tono, frase exacta y cualquier indicación visual."
              required
            />
          </label>
          <button className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-signal px-5 text-base font-bold text-ink transition hover:bg-white">
            Enviar material
            <Upload className="h-5 w-5" />
          </button>
        </form>
      </div>
    </main>
  );
}
