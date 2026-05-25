import Image from "next/image";
import { ArrowRight, Building2, GraduationCap, LockKeyhole, Megaphone, ShieldCheck, Zap } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

const steps = [
  {
    title: "Brief",
    text: "Nos cuentas el proyecto: portavoz, tono, guion y objetivos de marca. Nosotros hacemos las preguntas correctas."
  },
  {
    title: "Producimos",
    text: "Aplicamos dirección creativa y las mejores herramientas de IA para generar clips que cumplen tus brand guidelines."
  },
  {
    title: "Apruebas",
    text: "Revisas el resultado. Ajustamos hasta que esté listo para publicar. Tú siempre tienes la última palabra."
  }
];

const cases = [
  {
    icon: Megaphone,
    title: "Agencias de marketing",
    text: "Ofrece producción de video con IA a tus clientes sin montar un equipo propio. Más margen, más velocidad de entrega."
  },
  {
    icon: GraduationCap,
    title: "Formación online",
    text: "Actualiza o amplía cursos sin re-grabar al instructor. El contenido escala; la grabación no tiene que hacerlo."
  },
  {
    icon: Building2,
    title: "Marcas corporativas",
    text: "Tu portavoz en video para cualquier mercado, campaña o idioma. Sin depender de su disponibilidad."
  }
];

const reasons = [
  {
    icon: Zap,
    title: "Dirección creativa",
    text: "Sabemos qué pedirle a la IA. Un prompt mal formulado produce video inutilizable. Uno bien construido, un activo de marca."
  },
  {
    icon: ShieldCheck,
    title: "Consistencia de marca",
    text: "Tus brand guidelines aplicados clip a clip: tono, color, ritmo y mensaje alineados con tu identidad."
  },
  {
    icon: LockKeyhole,
    title: "Revisión humana",
    text: "Cada entregable pasa por ojos expertos antes de llegar a ti. La IA propone; nosotros validamos."
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
          <p className="eyebrow">Video con IA para empresas</p>
          <h1>
            Tu portavoz en video.
            <em>Sin grabar.</em>
          </h1>
          <p className="hero-description">
            Producimos clips de alta calidad con el gemelo digital de tu portavoz,
            guiados por dirección creativa. Tú apruebas. Nosotros entregamos.
            Sin estudio, sin agenda, sin fricción.
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
            <strong>Brief a entrega</strong>
            <span>En días, no meses</span>
          </div>
          <div>
            <strong>Sin equipo propio</strong>
            <span>Producción externalizada</span>
          </div>
          <div>
            <strong>Brand guidelines</strong>
            <span>Aplicados en cada clip</span>
          </div>
        </div>
      </section>

      <section className="statement shell">
        <p className="eyebrow">El problema</p>
        <h2>
          El video escala.
          <br />
          La grabación, no.
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
            {cases.map(({ icon: Icon, title, text }) => (
              <article className="case-card" key={title}>
                <Icon />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="assurance" id="por-que">
        <div className="shell assurance-grid">
          {reasons.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
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
