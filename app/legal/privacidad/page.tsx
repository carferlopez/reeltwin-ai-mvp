// TODO: Realizar una revisión legal formal antes del lanzamiento a producción comercial.
// Este documento sirve como plantilla básica estándar de política de privacidad bajo el RGPD europeo.

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-ink text-white py-12 md:py-20">
      <div className="legal-container">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-signal hover:underline mb-8"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al inicio
        </Link>
        
        <h1 className="legal-title">Política de Privacidad</h1>
        <p className="legal-meta">Última actualización: 27 de mayo de 2026</p>

        <div className="space-y-8">
          <section className="legal-section">
            <h2>1. Responsable del Tratamiento</h2>
            <p>
              El responsable del tratamiento de los datos personales recopilados en esta plataforma web es el titular legítimo del dominio ReelTwin.ai, cuyo contacto operativo está disponible en la dirección de correo electrónico: contacto@carlosmakes.com. Tratamos los datos personales de manera absolutamente transparente y segura, de acuerdo con el Reglamento General de Protección de Datos (RGPD) de la UE.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Datos Recogidos</h2>
            <p>
              Debido a nuestro modelo de negocio directo sin cuentas, recopilamos únicamente los datos necesarios para facturar y procesar el servicio:
              <br />
              • **Datos de Facturación y Pago**: Gestionados de manera segura directamente por Stripe Inc. (email del comprador, nombre e información del pago).
              <br />
              • **Material de Producción**: Vídeo base de entrenamiento (donde aparece el actor/performer) y guion de texto cargados de forma asíncrona mediante el formulario de admisión.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Finalidad del Tratamiento</h2>
            <p>
              La finalidad exclusiva del tratamiento de tus datos es la correcta prestación, renderizado y entrega del servicio contratado (creación del reel personalizado con estilo cinematográfico y su envío seguro por email). No utilizamos tu dirección de correo electrónico para fines de marketing, boletines comerciales ni publicidad invasiva.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Plazo de Conservación y Eliminación (TTL de 7 días)</h2>
            <p>
              Aplicamos una política de ciclo de vida del dato sumamente estricta y segura:
              <br />
              • **Vídeos de entrenamiento (vídeo base)**: Se almacenan de manera estrictamente privada en buckets protegidos de Supabase. **Se eliminan de forma permanente, irrecuperable y automática a los 7 días de la entrega del vídeo final**, mediante scripts automatizados diarios en nuestros servidores.
              <br />
              • **Vídeos entregados (vídeo final)**: Se eliminan del bucket público del servidor exactamente a los 30 días del procesamiento.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Derechos del Usuario (Derechos ARCO-POL)</h2>
            <p>
              Como titular de los datos, te asiste en todo momento el derecho a acceder, rectificar, limitar el tratamiento, solicitar la portabilidad y exigir la supresión inmediata de todos tus datos personales de nuestros registros. Para ejercer cualquiera de estos derechos, puedes enviar una solicitud formal por escrito al correo electrónico contacto@carlosmakes.com, acreditando tu identidad con la referencia del pago de Stripe correspondiente.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
