import Image from "next/image";
import { ArrowRight, Building2, GraduationCap, ShoppingBag } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

const steps = [
  {
    title: "Brief",
    text: "Nos cuentas el proyecto: qué necesitas, para qué canal y qué quieres transmitir. Nosotros hacemos las preguntas correctas."
  },
  {
    title: "Producimos",
    text: "Aplicamos dirección creativa y las mejores herramientas de IA para generar imágenes y video que cumplen tus brand guidelines."
  },
  {
    title: "Apruebas",
    text: "Revisas el resultado. Ajustamos hasta que esté listo para publicar. Tú siempre tienes la última palabra."
  }
];

const cases = [
  {
    icon: Building2,
    title: "Inmobiliarias",
    text: "Cada inmueble merece imágenes que vendan antes de que exista. Home staging virtual, renders fotorrealistas y video tour sin fotógrafo ni decorador.",
    tags: ["Imagen", "Video"]
  },
  {
    icon: ShoppingBag,
    title: "Tiendas online",
    text: "Fotos de producto y vídeos demo para cada SKU, campaña y temporada. El contenido visual que aumenta la conversión, sin sesión fotográfica.",
    tags: ["Imagen", "Video"]
  },
  {
    icon: GraduationCap,
    title: "Formación corporativa",
    text: "Actualiza cursos y módulos de onboarding sin re-grabar al instructor. El presentador siempre disponible, en cualquier idioma.",
    tags: ["Video"]
  }
];


export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <Image
          alt=""
          className="hero-image"
          fill
          priority
          sizes="100vw"
          src="/reeltwin-hero.png"
        />
        <div className="hero-overlay" />

        <header className="header shell">
          <a className="brand" href="/" aria-label="ReelTwin.ai inicio">
            ReelTwin<span>.ai</span>
          </a>
          <nav className="nav" aria-label="Principal">
            <a href="#como-funciona">Proceso</a>
            <a href="#casos">Para quién</a>
            <a className="nav-action" href="#contacto">
              Hablemos
            </a>
          </nav>
        </header>

        <div className="hero-copy shell">
          <p className="eyebrow">Imagen y video con IA para empresas</p>
          <h1>
            Contenido visual
            <em>sin sesión.</em>
          </h1>
          <p className="hero-description">
            Producimos imagen y video de alta calidad con IA, guiados por dirección creativa.
            Sin fotógrafo, sin estudio, sin esperar agenda.
            Tú apruebas. Nosotros entregamos.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#contacto">
              Hablemos de tu proyecto
              <ArrowRight />
            </a>
          </div>
        </div>

        <div className="hero-stats shell" aria-label="Características principales">
          <div>
            <strong>Imagen y video</strong>
            <span>Un único proveedor</span>
          </div>
          <div>
            <strong>Brief a entrega</strong>
            <span>En días, no semanas</span>
          </div>
          <div>
            <strong>Sin estudio</strong>
            <span>Sin fotógrafo, sin agenda</span>
          </div>
        </div>
      </section>

      <section className="statement shell">
        <p className="eyebrow">El problema</p>
        <h2>
          El contenido visual escala.
          <br />
          La sesión fotográfica, no.
        </h2>
      </section>

      <section className="workflow" id="como-funciona">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Cómo funciona</p>
            <h2>Tres pasos, sin fricción.</h2>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <article className="step" key={step.title}>
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cases" id="casos">
        <div className="shell">
          <div className="section-heading">
            <p className="eyebrow">Para quién</p>
            <h2>Tres tipos de cliente. Un mismo problema.</h2>
          </div>
          <div className="cases-grid">
            {cases.map(({ icon: Icon, title, text, tags }) => (
              <article className="case-card" key={title}>
                <div className="case-top">
                  <Icon />
                  <div className="case-tags">
                    {tags.map(tag => (
                      <span className="case-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="contact shell" id="contacto">
        <div className="contact-layout">
          <div className="contact-intro">
            <p className="eyebrow">Contacto</p>
            <h2>
              Cuéntanos
              <br />
              tu proyecto.
            </h2>
            <p>
              Sin compromisos. Revisamos tu caso y te respondemos
              en menos de 24 horas con una propuesta concreta
              o las preguntas que necesitamos para hacerla.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="footer shell">
        <span className="brand">
          ReelTwin<span>.ai</span>
        </span>
        <div className="footer-info">
          <span>Producción de video con IA para empresas</span>
          <span>© Carlos Makes, 2026</span>
        </div>
        <span>Respuesta en 24h</span>
      </footer>
    </main>
  );
}
