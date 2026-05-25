"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Film, 
  Video, 
  Sparkles,
  ArrowRight,
  Download
} from "lucide-react";
import { CINEMATIC_STYLES } from "../config/styles";

export function ReelForm({ initialOrderReference }: { initialOrderReference?: string }) {
  const searchParams = useSearchParams();
  const sessionId = initialOrderReference || searchParams.get("session_id") || searchParams.get("order") || "";

  // Form states
  const [email, setEmail] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("nordic-noir");
  const [script, setScript] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Instant Gemini Omni states
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalVideo, setFinalVideo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI/Status states
  const [isValidatingOrder, setIsValidatingOrder] = useState(false);
  const [isOrderValid, setIsOrderValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // Controlling "Cargando vídeo..."
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validate session_id/order on mount
  useEffect(() => {
    if (!sessionId) {
      setIsOrderValid(false);
      setValidationError("No se ha detectado ninguna referencia de pago (session_id). Completa el pago en Stripe.");
      return;
    }

    async function validateOrder() {
      setIsValidatingOrder(true);
      setValidationError(null);
      try {
        const response = await fetch(`/api/process-reel?order_reference=${encodeURIComponent(sessionId)}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsOrderValid(true);
          setEmail(data.email || "");
        } else {
          setIsOrderValid(false);
          setValidationError(data.error || "La referencia de pago no es válida o está pendiente de confirmación.");
        }
      } catch (err) {
        setIsOrderValid(false);
        setValidationError("Error al conectar con la base de datos de validación.");
      } finally {
        setIsValidatingOrder(false);
      }
    }

    validateOrder();
  }, [sessionId]);

  // Drag & drop handlers
  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFormError(null);
    setErrorMessage(null);
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
    
    if (!allowedTypes.includes(file.type)) {
      setFormError("Formato de vídeo no soportado (debe ser MP4, MOV o WebM).");
      return;
    }

    // 250 MB Size Limit
    if (file.size > 250 * 1024 * 1024) {
      setFormError("El archivo de vídeo supera el límite de 250 MB.");
      return;
    }

    setVideoFile(file);
  };

  // Form submission with secure direct upload + síncrono Gemini processing
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isOrderValid) return;
    if (!videoFile) {
      setFormError("Por favor, sube tu vídeo base de 1 minuto.");
      return;
    }
    if (script.length < 10) {
      setFormError("El guion es demasiado corto (mínimo 10 caracteres).");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setErrorMessage(null);
    setUploadProgress(0);
    setStatusMessage("Cargando vídeo..."); // Visual state: Loading video...

    try {
      // 1. Fetch the signed upload URL and video URL from our API
      const res = await fetch(`/api/process-reel?order_reference=${encodeURIComponent(sessionId)}&action=get-upload-url&filename=${encodeURIComponent(videoFile.name)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "No se pudo obtener la autorización de subida.");
      }
      const uploadData = await res.json();
      const { uploadUrl, videoUrl } = uploadData;

      // 2. Perform direct upload to the signed Supabase Storage URL using XMLHttpRequest
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Upload successful! Turn off isSubmitting, turn on isProcessing for Gemini Omni síncrono phase
          setIsSubmitting(false);
          setIsProcessing(true);

          try {
            // 3. POST JSON metadata to the instant processing API route
            const apiResponse = await fetch("/api/process-instant", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                sessionId: sessionId,
                selectedStyle: selectedStyle,
                videoUrl: videoUrl,
                scriptText: script
              })
            });

            const apiData = await apiResponse.json();

            if (apiResponse.ok && apiData.success) {
              setFinalVideo(apiData.finalVideoUrl);
            } else {
              setErrorMessage(apiData.error || "Ocurrió un error al procesar tu escena instantánea.");
            }
          } catch (apiErr) {
            setErrorMessage("Error de conexión con la API del servidor.");
          } finally {
            setIsProcessing(false);
          }
        } else {
          setFormError("Fallo al subir el archivo de vídeo al almacenamiento seguro.");
          setIsSubmitting(false);
        }
      });

      xhr.addEventListener("error", () => {
        setFormError("Error de red durante la transferencia del archivo.");
        setIsSubmitting(false);
      });

      // PUT is required for Supabase signed upload URLs
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", videoFile.type);
      xhr.send(videoFile);

    } catch (err: any) {
      setFormError(err.message || "Error al iniciar el proceso de subida.");
      setIsSubmitting(false);
    }
  };

  if (isValidatingOrder) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-zinc/40 bg-steel/80 p-8 text-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-signal" />
        <p className="mt-4 text-sm text-slate-400">Autenticando referencia de sesión de Stripe...</p>
      </div>
    );
  }

  if (isOrderValid === false) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-steel p-6 text-center text-white md:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold">Verificación de Pago Fallida</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-md mx-auto">
          {validationError || "La referencia de sesión de Stripe no es válida o está pendiente de confirmación de pago."}
        </p>
      </div>
    );
  }

  // Visual Loading State: Gemini Omni síncrono processing
  if (isProcessing) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-ink p-8 text-center text-white border border-zinc/30 shadow-2xl animate-pulse">
        <Loader2 className="h-12 w-12 animate-spin text-signal mb-6" />
        <h3 className="text-xl font-bold mb-3">Esculpiendo tu escena...</h3>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">
          Gemini Omni está esculpiendo tu escena cinematográfica. Esto tomará unos 30 segundos... No cierres esta pestaña.
        </p>
      </div>
    );
  }

  // Visual Success State: Final Video Rendered & Downloadable
  if (finalVideo) {
    return (
      <div className="rounded-2xl border border-signal/20 bg-steel p-6 text-center text-white md:p-9 shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-signal/10 text-signal mb-6">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-2xl font-bold mb-6">¡Éxito! Tu reel está listo.</h3>
        
        <div className="relative overflow-hidden rounded-xl border border-signal shadow-xl max-w-lg mx-auto bg-black">
          <video 
            controls 
            className="w-full h-auto aspect-video" 
            src={finalVideo}
          />
        </div>
        
        <div className="mt-8 flex justify-center">
          <a
            href={finalVideo}
            download="completed-reel.mp4"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl bg-signal hover:bg-[#e2ff78] px-8 py-4 text-lg font-bold text-ink transition-all duration-200 shadow-lg hover:shadow-signal/20 active:translate-y-0.5"
          >
            <Download className="h-5 w-5" />
            Descargar vídeo
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-zinc/40 bg-steel p-6 text-white md:p-9 shadow-2xl"
    >
      {formError && (
        <div className="flex items-start gap-3 rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm text-white">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error de subida: </span>
            {formError}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-xl bg-danger/10 border border-danger/20 p-4 text-sm text-white">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error de proceso: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Checkout Reference Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">ID de Sesión (Pago)</span>
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-zinc bg-ink px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
            disabled
            type="text"
            value={sessionId}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Email Registrado</span>
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-zinc bg-ink px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
            disabled
            type="email"
            value={email}
          />
        </label>
      </div>

      {/* Style Selector */}
      <div className="block">
        <div className="flex items-center gap-2 mb-3">
          <Film className="h-4 w-4 text-signal" />
          <span className="text-sm font-bold uppercase tracking-wider text-slate-300">1. Selecciona tu Estilo Cinematográfico</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-3">
          {Object.values(CINEMATIC_STYLES).map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                type="button"
                className={`relative flex flex-col text-left p-5 rounded-xl border transition-all duration-200 outline-none ${
                  isSelected
                    ? "bg-signal/5 border-signal shadow-xl shadow-signal/5 text-white"
                    : "bg-ink/40 border-zinc/60 hover:border-zinc text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">{style.name}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-signal shadow-md shadow-signal" />
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {style.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-zinc/30">
                  <span className="text-[10px] text-signal font-bold uppercase tracking-wider">
                    Fondo Dinámico Activo
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Script Textarea (500 characters max) */}
      <label className="block">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-signal" />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-300">2. Guion / Monólogo</span>
          </div>
          <span className={`text-xs font-mono ${script.length > 500 ? "text-danger" : "text-slate-500"}`}>
            {script.length} / 500 car.
          </span>
        </div>
        <textarea
          className="mt-2 w-full min-h-[120px] rounded-xl border border-zinc bg-ink p-4 text-sm text-white outline-none focus:border-signal transition duration-200 resize-y leading-relaxed"
          maxLength={500}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Escribe el texto exacto que interpretará tu gemelo digital (máximo 500 caracteres, aprox. 80-90 palabras)."
          required
          value={script}
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>Clonaremos tu voz exacta basándonos en tu guion.</span>
          <span>Máximo 500 caracteres.</span>
        </div>
      </label>

      {/* Drag & Drop upload zone */}
      <div className="block">
        <div className="flex items-center gap-2 mb-3">
          <Video className="h-4 w-4 text-signal" />
          <span className="text-sm font-bold uppercase tracking-wider text-slate-300">3. Vídeo base de referencia (máximo 1 min)</span>
        </div>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center cursor-pointer transition duration-200 ${
            dragActive 
              ? "border-signal bg-signal/5" 
              : videoFile 
                ? "border-mint/50 bg-mint/5" 
                : "border-zinc hover:border-zinc/80 bg-ink/20"
          }`}
        >
          <input
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />

          {videoFile ? (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/10 text-mint">
                <Video className="h-6 w-6" />
              </div>
              <span className="mt-3 text-sm font-bold">{videoFile.name}</span>
              <span className="mt-1 text-xs text-slate-500">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Archivo validado
              </span>
              <span className="mt-4 text-xs font-semibold text-signal uppercase tracking-wider hover:underline">
                Seleccionar otro vídeo
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc/30 text-slate-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="mt-3 text-sm font-semibold">
                Arrastra tu vídeo aquí o <span className="text-signal hover:underline">búscalo en tu ordenador</span>
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Solo MP4, MOV o WebM. Límite de 250 MB.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Massive Brutalist Button */}
      <div className="pt-4 border-t border-zinc/30">
        {isSubmitting ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Loader2 className="h-4 w-4 animate-spin text-signal" />
                {statusMessage}
              </span>
              <span className="font-mono text-signal font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-ink border border-zinc/30">
              <div 
                className="h-full bg-signal rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!videoFile || script.length < 10}
            className={`flex min-h-[58px] w-full items-center justify-center gap-3 rounded-xl text-lg font-bold transition-all duration-200 ${
              videoFile && script.length >= 10
                ? "bg-signal text-ink hover:bg-[#e2ff78] cursor-pointer shadow-lg shadow-signal/10 active:translate-y-0.5"
                : "bg-zinc/35 text-slate-500 cursor-not-allowed"
            }`}
          >
            Generar Gemelo Digital
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}
