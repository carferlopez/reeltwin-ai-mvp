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
  ArrowRight
} from "lucide-react";
import { CINEMATIC_STYLES } from "../config/styles";

export function ReelForm() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || searchParams.get("order") || "";

  // Form states
  const [email, setEmail] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("nordic-noir");
  const [script, setScript] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  // UI/Status states
  const [isValidatingOrder, setIsValidatingOrder] = useState(false);
  const [isOrderValid, setIsOrderValid] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // Controlling "Cargando vídeo...", "Procesando..."
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fileInputRef = useRef(null);

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
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setFormError(null);
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

  // Form submission
  const handleSubmit = async (e) => {
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
          if (percent === 100) {
            setStatusMessage("Procesando..."); // Visual state: Processing...
          }
        }
      });

      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Upload successful! Proceed to Step 3: POST JSON metadata to process-reel
          try {
            const apiResponse = await fetch("/api/process-reel", {
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
              setFormSuccess(true);
            } else {
              setFormError(apiData.error || "Ocurrió un error al registrar los datos de producción.");
              setIsSubmitting(false);
            }
          } catch (apiErr) {
            setFormError("Fallo al contactar con la API del servidor.");
            setIsSubmitting(false);
          }
        } else {
          setFormError("Fallo al subir el archivo de vídeo al almacenamiento seguro de Supabase.");
          setIsSubmitting(false);
        }
      });

      xhr.addEventListener("error", () => {
        setFormError("Error de red durante la subida directa del vídeo.");
        setIsSubmitting(false);
      });

      // PUT is required for Supabase signed upload URLs
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", videoFile.type);
      xhr.send(videoFile);

    } catch (err) {
      setFormError(err.message || "Error al iniciar el proceso de subida.");
      setIsSubmitting(false);
    }
  };

  if (isValidatingOrder) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-sm text-slate-400">Autenticando referencia de sesión de Stripe...</p>
      </div>
    );
  }

  if (isOrderValid === false) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-6 text-center text-white md:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold">Verificación de Pago Fallida</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-md mx-auto">
          {validationError || "La referencia de sesión de Stripe no es válida o está pendiente de confirmación de pago."}
        </p>
      </div>
    );
  }

  if (formSuccess) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-slate-900 p-8 text-center text-white md:p-12 shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500 shadow-lg shadow-green-500/10">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h3 className="mt-6 text-2xl font-bold">¡Éxito! Tu reel estará listo en 24h.</h3>
        <p className="mt-3 text-sm text-slate-400 max-w-sm mx-auto">
          Hemos recibido tu material y nuestro motor de inteligencia artificial ya está procesando tu gemelo digital.
        </p>
        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition"
          >
            Volver a inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white md:p-9 shadow-2xl"
    >
      {formError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-white">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error de envío: </span>
            {formError}
          </div>
        </div>
      )}

      {/* Checkout Reference Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">ID de Sesión (Pago)</span>
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
            disabled
            type="text"
            value={sessionId}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-300">Email Registrado</span>
          <input
            className="mt-2 min-h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm text-slate-500 outline-none cursor-not-allowed"
            disabled
            type="email"
            value={email}
          />
        </label>
      </div>

      {/* Style Selector */}
      <div className="block">
        <div className="flex items-center gap-2 mb-3">
          <Film className="h-4 w-4 text-blue-500" />
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
                    ? "bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-500/5 text-white"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">{style.name}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-blue-500 shadow-md shadow-blue-500" />
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {style.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
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
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-300">2. Guion / Monólogo</span>
          </div>
          <span className={`text-xs font-mono ${script.length > 500 ? "text-red-500" : "text-slate-500"}`}>
            {script.length} / 500 car.
          </span>
        </div>
        <textarea
          className="mt-2 w-full min-h-[120px] rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-white outline-none focus:border-blue-500 transition duration-200 resize-y leading-relaxed"
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
          <Video className="h-4 w-4 text-blue-500" />
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
              ? "border-blue-500 bg-blue-500/10" 
              : videoFile 
                ? "border-green-500/50 bg-green-500/5" 
                : "border-slate-800 hover:border-slate-700 bg-slate-950/20"
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
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                <Video className="h-6 w-6" />
              </div>
              <span className="mt-3 text-sm font-bold">{videoFile.name}</span>
              <span className="mt-1 text-xs text-slate-500">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Archivo validado
              </span>
              <span className="mt-4 text-xs font-semibold text-blue-500 uppercase tracking-wider hover:underline">
                Seleccionar otro vídeo
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-850 text-slate-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="mt-3 text-sm font-semibold">
                Arrastra tu vídeo aquí o <span className="text-blue-500 hover:underline">búscalo en tu ordenador</span>
              </span>
              <span className="mt-1 text-xs text-slate-500">
                Solo MP4, MOV o WebM. Límite de 250 MB.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Massive Brutalist Button */}
      <div className="pt-4 border-t border-slate-800">
        {isSubmitting ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                {statusMessage}
              </span>
              <span className="font-mono text-blue-500 font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
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
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg shadow-blue-500/10 active:translate-y-0.5"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
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
