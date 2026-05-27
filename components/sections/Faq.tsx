"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "¿Qué es ReelTwin.ai?",
    answer: "ReelTwin.ai es una plataforma transaccional de producción asistida por inteligencia artificial diseñada para fotógrafos, estudios de producción y agencias que necesitan generar variaciones de vídeo cinematográficas y clones digitales sin necesidad de crear una cuenta o registrarse previamente."
  },
  {
    id: "faq-2",
    question: "¿Cómo funciona el proceso de creación del clon digital?",
    answer: "El proceso consta de tres sencillos pasos: realiza el pago seguro del pack deseado mediante Stripe, accede a la página de admisión privada para subir un vídeo base corto (donde aparezca el actor) junto con el guion en texto, y nuestro sistema de IA procesará la escena integrando el clon visual en el estilo cinematográfico elegido."
  },
  {
    id: "faq-3",
    question: "¿Cuánto tiempo se tarda en entregar el material final?",
    answer: "Nuestro flujo de procesamiento de alta velocidad entrega los archivos finales directamente a tu correo electrónico en un plazo garantizado de menos de 24 horas. En la simulación de pruebas local, la confirmación y previsualización se resuelven en menos de un minuto."
  },
  {
    id: "faq-4",
    question: "¿Qué requisitos debe cumplir el vídeo base de entrenamiento?",
    answer: "Para garantizar una fidelidad visual de alta calidad, recomendamos subir un archivo en formato MP4 o MOV con un tamaño máximo de 500 MB. El vídeo debe mostrar a la persona bajo una iluminación clara, de frente, con buena resolución y realizando movimientos naturales de cabeza o habla."
  },
  {
    id: "faq-5",
    question: "¿Qué derechos de propiedad intelectual tengo sobre el material entregado?",
    answer: "Tú mantienes el 100% de la autoría y derechos comerciales sobre el material entregado. ReelTwin.ai actúa únicamente como un procesador técnico asistido por IA. No nos quedamos con ningún derecho sobre los rostros, voces ni guiones cargados."
  },
  {
    id: "faq-6",
    question: "¿Cómo se protegen mis datos y cuándo se eliminan de los servidores?",
    answer: "La privacidad y seguridad de tu material es nuestra prioridad absoluta. El vídeo base y el guion cargados se almacenan de forma totalmente privada utilizando políticas estrictas en Supabase Storage (bypasseando accesos públicos). Ejecutamos tareas automatizadas diarias que purgan y eliminan de forma permanente e irrecuperable todo el material de entrenamiento y producción exactamente 7 días después de haber sido entregado con éxito."
  }
];

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="faq-section py-20 border-t border-zinc/20 bg-ink" id="faq">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-signal text-center mb-4">
          Soporte y Consultas
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-normal leading-tight text-white text-center mb-12">
          Preguntas Frecuentes
        </h2>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-signal bg-steel"
                    : "border-zinc bg-steel/40 hover:border-zinc-300/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={item.id}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-sans font-medium text-base md:text-lg text-white pr-4">
                    {item.question}
                  </span>
                  <span
                    className={`rounded-full bg-zinc/30 p-2 flex items-center justify-center border border-white/5 transition-transform duration-300 text-zinc-300 ${
                      isOpen ? "rotate-180 text-signal" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={item.id}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 border-t border-white/5 mt-1">
                        <p className="font-sans text-sm md:text-base leading-relaxed text-zinc-400">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      {/* TODO comment for future legal review of the FAQ section */}
    </section>
  );
}
