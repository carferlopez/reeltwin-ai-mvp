// TODO: Realizar una revisión legal formal antes del lanzamiento a producción comercial.
// Este documento sirve como plantilla básica estándar de aviso legal bajo la legislación española (LSSI-CE).

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AvisoLegalPage() {
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
        
        <h1 className="legal-title">Aviso Legal</h1>
        <p className="legal-meta">Última actualización: 27 de mayo de 2026</p>

        <div className="space-y-8">
          <section className="legal-section">
            <h2>1. Información del Titular</h2>
            <p>
              En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se hace constar que el sitio web ReelTwin.ai es operado de forma independiente para la facilitación de servicios técnicos de procesamiento multimedia. Para cualquier consulta o comunicación, puede ponerse en contacto a través de la dirección de correo electrónico: contacto@carlosmakes.com.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Objeto y Ámbito de Aplicación</h2>
            <p>
              El presente Aviso Legal regula el acceso, navegación y utilización de la plataforma web ReelTwin.ai, la cual ofrece servicios de modelado y renderizado asistido por inteligencia artificial para la generación de clips de vídeo personalizados (clones digitales) para perfiles profesionales, estudios fotográficos, y agencias de producción.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Condiciones de Uso y Acceso</h2>
            <p>
              El acceso a ReelTwin.ai no requiere registro previo ni creación de cuenta, operando bajo un modelo puramente transaccional. El usuario se compromete a hacer un uso lícito y diligente del portal, absteniéndose de utilizar los servicios para subir contenidos protegidos por derechos de terceros sin su consentimiento, materiales difamatorios, de contenido violento, sexualmente explícito, o que vulneren los derechos fundamentales y libertades públicas.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Propiedad Intelectual e Industrial</h2>
            <p>
              Todos los derechos de propiedad intelectual del diseño de la web, código fuente, logotipos y marcas pertenecen a su titular legítimo. En cuanto a las generaciones resultantes obtenidas mediante el procesamiento técnico por IA, ReelTwin.ai no retiene ningún derecho de propiedad ni autoría comercial sobre el material final entregado, siendo este de entera titularidad y responsabilidad exclusiva del cliente comprador.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Limitación de Responsabilidad</h2>
            <p>
              ReelTwin.ai actúa únicamente como un intermediario técnico de procesamiento automático. No nos hacemos responsables de las posibles suplantaciones de identidad que el cliente pueda realizar al cargar vídeos de terceros sin autorización, siendo responsabilidad total del usuario garantizar que cuenta con los derechos de imagen de los actores que cargue en la admisión. El titular declina cualquier tipo de responsabilidad derivada de la información publicada en su sitio web cuando esta haya sido manipulada o introducida por un tercero ajeno.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Ley Aplicable y Jurisdicción</h2>
            <p>
              Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación española, a la que se someten expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o relacionados con su uso los Juzgados y Tribunales de Madrid (España).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
