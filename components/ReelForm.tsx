"use client";

import { useState, useEffect, useRef, type DragEvent, type ChangeEvent } from "react";
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Film, 
  Video, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { CINEMATIC_STYLES } from "@/config/styles";

interface ReelFormProps {
  initialOrderReference: string;
}

export function ReelForm({ initialOrderReference }: ReelFormProps) {
  // Form states
  const [orderReference, setOrderReference] = useState(initialOrderReference);
  const [email, setEmail] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("nordic-noir");
  const [script, setScript] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Verification & UI states
  const [isValidatingOrder, setIsValidatingOrder] = useState(false);
  const [isOrderValid, setIsOrderValid] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate Order Reference on mount or when reference changes
  useEffect(() => {
    if (!orderReference) {
      setIsOrderValid(false);
      setValidationError("No se ha proporcionado ninguna referencia de pedido. Completa el pago primero.");
      return;
    }

    async function validateOrder() {
      setIsValidatingOrder(true);
      setValidationError(null);
      try {
        const response = await fetch(`/api/process-reel?order_reference=${encodeURIComponent(orderReference)}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setIsOrderValid(true);
          setEmail(data.email || "");
        } else {
          setIsOrderValid(false);
          setValidationError(data.error || "Pedido no encontrado o pendiente de pago.");
        }
      } catch (err) {
        setIsOrderValid(false);
        setValidationError("Error de conexión al validar el pedido. Inténtalo de nuevo.");
      } finally {
        setIsValidatingOrder(false);
      }
    }

    validateOrder();
  }, [orderReference]);

  // Drag and drop handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFormError(null);
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
    
    if (!allowedTypes.includes(file.type)) {
      setFormError("Formato no soportado. Sube un vídeo en formato MP4, MOV o WebM.");
      return;
    }

    // 250 MB Limit
    if (file.size > 250 * 1024 * 1024) {
      setFormError("El vídeo es demasiado grande (máximo 250 MB). Redúcelo o comprímelo.");
      return;
    }

    setVideoFile(file);
  };

  // Submit form via XHR to track progress
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrderValid) return;
    if (!videoFile) {
      setFormError("Por favor, sube tu vídeo de entrenamiento.");
      return;
    }
    if (script.length < 10) {
      setFormError("El guion es demasiado corto (mínimo 10 caracteres).");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("order_reference", orderReference);
    formData.append("email", email);
    formData.append("style", selectedStyle);
    formData.append("script", script);
    formData.append("training_video", videoFile);

    // Using XHR for progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      const responseData = JSON.parse(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300 && responseData.success) {
        setFormSuccess(true);
        // Redirect to success after a brief delay
        setTimeout(() => {
          window.location.href = responseData.redirectUrl || "/intake/success";
        }, 1500);
      } else {
        setFormError(responseData.error || "Ocurrió un error al procesar tu solicitud.");
        setIsSubmitting(false);
      }
    });

    xhr.addEventListener("error", () => {
      setFormError("Error de conexión durante la subida. Asegúrate de tener una conexión estable.");
      setIsSubmitting(false);
    });

    xhr.open("POST", "/api/process-reel");
    xhr.send(formData);
  };

  // Loading state during order validation
  if (isValidatingOrder) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-lg border border-zinc/40 bg-steel p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-signal" />
        <p className="mt-4 text-sm text-zinc-400">Verificando tu pedido en la pasarela segura...</p>
      </div>
    );
  }

  // Invalid order reference view
  if (isOrderValid === false) {
    return (
      <div className="rounded-lg border border-danger/25 bg-steel p-6 text-center md:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-white">Verificación de Pago Fallida</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 max-w-md mx-auto">
          {validationError || "No hemos podido encontrar un pago válido asociado a este enlace."}
        </p>
        <div className="mt-8 flex flex-col gap-3 justify-center sm:flex-row">
          <input
            className="rounded-md border border-zinc bg-ink px-4 py-2 text-sm text-white outline-none focus:border-signal min-w-[240px]"
            onChange={(e) => setOrderReference(e.target.value)}
            placeholder="Introduce tu ID de Sesión de Stripe"
            type="text"
            value={orderReference}
          />
          <button 
            onClick={() => setOrderReference(orderReference)}
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-bold text-ink hover:bg-white transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Success Overlay
  if (formSuccess) {
    return (
      <div className="rounded-lg border border-mint/20 bg-steel p-8 text-center md:p-12 animate-pulse">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/10 text-mint">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h3 className="mt-6 text-2xl font-bold text-white">¡Material Recibido con Éxito!</h3>
        <p className="mt-3 text-zinc-400">Procesando tu gemelo digital...</p>
        <p className="mt-1 text-xs text-zinc-500">Redireccionando en breves momentos.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-lg border border-zinc bg-steel p-6 md:p-9 shadow-xl"
    >
      {formError && (
        <div className="flex items-start gap-3 rounded-md bg-danger/10 border border-danger/20 p-4 text-sm text-white">
          <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-danger">Error: </span>
            {formError}
          </div>
        </div>
      )}

      {/* Hidden/Disabled references */}
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-zinc-300">Referencia de Pedido</span>
          <input
            className="mt-2.5 min-h-12 w-full rounded-md border border-zinc bg-ink/50 px-4 text-sm text-zinc-400 outline-none cursor-not-allowed"
            disabled
            type="text"
            value={orderReference}
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-zinc-300">Email del Cliente</span>
          <input
            className="mt-2.5 min-h-12 w-full rounded-md border border-zinc bg-ink/50 px-4 text-sm text-zinc-400 outline-none cursor-not-allowed"
            disabled
            type="email"
            value={email}
          />
        </label>
      </div>

      {/* Paso 1: Estilo Cinematográfico */}
      <div className="block">
        <div className="flex items-center gap-2 mb-3">
          <Film className="h-4 w-4 text-signal" />
          <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">1. Elige la Dirección Cinematográfica</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 mt-3">
          {Object.values(CINEMATIC_STYLES).map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                type="button"
                className={`relative flex flex-col text-left p-5 rounded-lg border transition duration-200 outline-none ${
                  isSelected
                    ? "bg-zinc/30 border-signal shadow-lg shadow-signal/5"
                    : "bg-ink/30 border-zinc hover:border-zinc/70"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white">{style.name}</span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-signal shadow-md shadow-signal" />
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400 flex-grow">
                  {style.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-zinc/20">
                  <span className="text-[10px] text-signal font-semibold uppercase tracking-wider">
                    Fondos Dinámicos IA:
                  </span>
                  <span className="text-[10px] text-zinc-400 italic">
                    Generación única por toma
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paso 2: Guion */}
      <label className="block">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-signal" />
            <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">2. Escribe tu Guion</span>
          </div>
          <span className={`text-xs font-mono ${script.length > 1200 || script.length < 10 ? "text-danger" : "text-zinc-500"}`}>
            {script.length} / 1200 car.
          </span>
        </div>
        <textarea
          className="mt-2 w-full min-h-[140px] rounded-md border border-zinc bg-ink p-4 text-sm text-white outline-none focus:border-signal transition duration-200 resize-y leading-relaxed"
          maxLength={1200}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Escribe la frase exacta que dirá tu clon (máx 10 segundos de audio, aprox. 20-30 palabras). Ej: 'No puedes estar en dos sitios a la vez... ¿o sí? Multiplica tu presencia en vídeo con ReelTwin.'"
          required
          value={script}
        />
        <div className="mt-1.5 flex justify-between text-[11px] text-zinc-500">
          <span>Mínimo 10 caracteres.</span>
          <span>Clonaremos tu voz exacta con este texto.</span>
        </div>
      </label>

      {/* Paso 3: Vídeo de Entrenamiento */}
      <div className="block">
        <div className="flex items-center gap-2 mb-3">
          <Video className="h-4 w-4 text-signal" />
          <span className="text-sm font-bold uppercase tracking-wider text-zinc-300">3. Sube tu vídeo base de 1 minuto</span>
        </div>
        
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-7 text-center cursor-pointer transition duration-200 ${
            dragActive 
              ? "border-signal bg-zinc/20" 
              : videoFile 
                ? "border-mint/50 bg-mint/5" 
                : "border-zinc hover:border-zinc/70 bg-ink/20"
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
              <span className="mt-3 text-sm font-bold text-white">{videoFile.name}</span>
              <span className="mt-1 text-xs text-zinc-500">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB • Listo para subir
              </span>
              <span className="mt-4 text-xs font-semibold text-signal uppercase tracking-wider hover:underline">
                Cambiar vídeo
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc/30 text-zinc-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <span className="mt-3 text-sm font-semibold text-zinc-300">
                Arrastra tu vídeo aquí o <span className="text-signal hover:underline">búscalo en tu equipo</span>
              </span>
              <span className="mt-1 text-xs text-zinc-500">
                Formatos: MP4, MOV o WebM. Máximo 250 MB.
              </span>
              <span className="mt-2 text-xs text-zinc-500 italic">
                Asegúrate de que haya buena luz de frente y no haya ruidos de fondo.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Submit / Progress Section */}
      <div className="pt-4 border-t border-zinc/20">
        {isSubmitting ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Loader2 className="h-4 w-4 animate-spin text-signal" />
                Subiendo material y clonando tu gemelo...
              </span>
              <span className="font-mono text-signal font-bold">{uploadProgress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc">
              <div 
                className="h-full bg-signal rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed text-center">
              No cierres ni refresques esta pestaña. Las subidas de vídeo pueden tardar un par de minutos según tu velocidad de conexión.
            </p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!videoFile || script.length < 10}
            className={`flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full text-base font-bold transition duration-200 ${
              videoFile && script.length >= 10
                ? "bg-signal text-ink hover:bg-white cursor-pointer shadow-lg shadow-signal/10"
                : "bg-zinc text-zinc-500 cursor-not-allowed"
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
