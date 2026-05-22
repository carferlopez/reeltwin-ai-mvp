import { Upload } from "lucide-react";

export default async function IntakePage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; order?: string }>;
}) {
  const params = await searchParams;
  const orderReference = params.session_id ?? params.order ?? "";

  return (
    <main className="min-h-screen bg-ink px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <a className="font-mono text-xs uppercase text-signal" href="/">
          ReelTwin.ai
        </a>
        <h1 className="mt-8 text-4xl font-black uppercase leading-none md:text-6xl">
          Sube tu video base y guion.
        </h1>
        <p className="mt-5 text-lg leading-7 text-zinc-300">
          Este formulario solo debe compartirse despues del pago. El material se
          guarda en un bucket privado y se elimina tras cerrar la entrega.
        </p>

        <form
          action="/api/intake"
          className="mt-8 space-y-5 border-2 border-white bg-steel p-5 shadow-hard"
          encType="multipart/form-data"
          method="post"
        >
          <input name="order_reference" type="hidden" value={orderReference} />
          <label className="block">
            <span className="font-mono text-xs uppercase text-signal">Email</span>
            <input
              className="mt-2 min-h-14 w-full border-2 border-white bg-ink px-4 text-white outline-none focus:border-signal"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase text-signal">
              Video base
            </span>
            <input
              accept="video/mp4,video/quicktime,video/webm"
              className="mt-2 w-full border-2 border-white bg-ink p-4 text-sm text-white file:mr-4 file:border-0 file:bg-signal file:px-4 file:py-2 file:font-black file:uppercase file:text-ink"
              name="training_video"
              required
              type="file"
            />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase text-signal">Guion</span>
            <textarea
              className="mt-2 min-h-40 w-full border-2 border-white bg-ink p-4 text-white outline-none focus:border-signal"
              maxLength={1200}
              name="script"
              placeholder="Escena, tono, frase exacta y cualquier indicacion visual."
              required
            />
          </label>
          <button className="flex min-h-16 w-full items-center justify-center gap-2 border-2 border-signal bg-signal px-5 text-lg font-black uppercase text-ink transition hover:bg-ink hover:text-signal">
            Enviar material
            <Upload className="h-5 w-5" />
          </button>
        </form>
      </div>
    </main>
  );
}
