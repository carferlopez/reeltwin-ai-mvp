"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Video, Download, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "processing" | "completed" | "error">("loading");
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No se ha proporcionado un ID de sesión válido.");
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/order-status?session_id=${sessionId}`);
        if (!response.ok) {
          throw new Error("Error al consultar el estado del pedido.");
        }
        
        const data = await response.json();
        
        if (data.customerEmail) {
          setCustomerEmail(data.customerEmail);
        }

        if (data.status === "completed" && data.finalVideoUrl) {
          setFinalVideoUrl(data.finalVideoUrl);
          setStatus("completed");
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else if (data.status === "failed") {
          setStatus("error");
          setErrorMsg("La generación de tu reel ha fallado en nuestros servidores de IA.");
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        } else {
          // If status is paid, data_received, processing, etc.
          setStatus("processing");
        }
      } catch (err: any) {
        console.error("Error polling status:", err);
        // We do not immediately show error state in case of transient network issues, unless we retry a lot
        if (retryCount > 5) {
          setStatus("error");
          setErrorMsg(err.message || "Error al conectar con el servidor.");
        } else {
          setRetryCount(prev => prev + 1);
        }
      }
    };

    // Initial check
    checkStatus();

    // Setup polling every 10 seconds
    pollIntervalRef.current = setInterval(checkStatus, 10000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId, retryCount]);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header / Logo */}
      <div className="mb-12">
        <Link className="text-xl font-bold text-white" href="/">
          ReelTwin<span className="text-signal">.ai</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-white/10 bg-steel p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-signal/10 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-48 w-48 rounded-full bg-mint/5 blur-3xl" />

        {/* LOADING & PROCESSING STATE */}
        {(status === "loading" || status === "processing") && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-full bg-signal/20 animate-ping opacity-75" />
              <div className="relative rounded-full bg-zinc p-5 border border-white/5 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-signal animate-spin" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal mb-4">
              Cola de Producción Activa
            </p>
            <h1 className="font-display text-4xl font-normal leading-tight text-white mb-6 md:text-5xl">
              Generando tu Reel Cinematográfico...
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 mb-8">
              Nuestra IA está sintetizando tu clon visual con la iluminación del estilo elegido. Esto suele tardar alrededor de 30-60 segundos en simulación y hasta 24h en entornos reales.
            </p>
            <div className="w-full bg-zinc/30 rounded-full h-1.5 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-signal to-mint h-full animate-[loading-bar_10s_infinite_linear]" style={{ width: "80%" }} />
            </div>
            <div className="mt-8 text-xs text-zinc-500 flex items-center gap-2">
              <RefreshCw className="h-3 w-3 animate-spin text-zinc-500" />
              <span>Actualizando estado en tiempo real (cada 10s)...</span>
            </div>
          </div>
        )}

        {/* COMPLETED STATE */}
        {status === "completed" && (
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center rounded-full bg-mint/10 p-3 border border-mint/20 mb-6">
              <CheckCircle2 className="h-8 w-8 text-mint" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint mb-3">
              Procesamiento Completado
            </p>
            <h1 className="font-display text-4xl font-normal leading-tight text-white text-center mb-6 md:text-5xl">
              ¡Tu reel está listo!
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400 text-center mb-8 max-w-md">
              Hemos renderizado tu gemelo digital con éxito. El archivo final se ha enviado a <span className="text-white font-medium">{customerEmail || "tu correo registrado"}</span> y está disponible para descarga a continuación.
            </p>

            {/* Video Player */}
            {finalVideoUrl && (
              <div className="w-full aspect-[9/16] max-w-[320px] rounded-2xl border border-white/10 bg-black overflow-hidden relative shadow-2xl mb-8 group">
                <video
                  className="w-full h-full object-cover"
                  src={finalVideoUrl}
                  controls
                  playsInline
                  autoPlay
                  loop
                  muted
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              {finalVideoUrl && (
                <a
                  href={finalVideoUrl}
                  download="reeltwin-completed.mp4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-signal text-ink font-semibold rounded-full hover:bg-[#c2e646] active:scale-[0.98] transition-all"
                >
                  <Download className="h-5 w-5" />
                  Descargar vídeo MP4
                </a>
              )}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc text-white font-semibold rounded-full border border-white/10 hover:bg-zinc/80 active:scale-[0.98] transition-all"
              >
                Encargar otro
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="text-xs text-zinc-500 mt-6 text-center">
              Nota: El enlace de descarga y el almacenamiento en el servidor expirarán en 30 días.
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="rounded-full bg-danger/10 p-4 border border-danger/20 mb-6">
              <AlertCircle className="h-10 w-10 text-danger" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-danger mb-3">
              Error de Procesamiento
            </p>
            <h1 className="font-display text-4xl font-normal leading-tight text-white mb-6 md:text-5xl">
              Ups, algo ha fallado.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-zinc-400 mb-8">
              {errorMsg || "No se ha podido procesar el vídeo o conectar con el servidor de la API."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={() => setRetryCount(0)}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-signal text-ink font-semibold rounded-full hover:bg-[#c2e646] transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar consulta
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc text-white font-semibold rounded-full border border-white/10 hover:bg-zinc/80 transition-all"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntakeSuccessPage() {
  return (
    <main className="min-h-screen bg-ink px-5 py-12 text-white md:px-8 md:py-20 flex items-center justify-center">
      <Suspense fallback={
        <div className="mx-auto max-w-2xl w-full flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-signal animate-spin mb-4" />
          <p className="text-sm text-zinc-400">Cargando confirmación...</p>
        </div>
      }>
        <SuccessPageContent />
      </Suspense>
    </main>
  );
}
