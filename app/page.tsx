import Image from "next/image";
import {
  Clock3,
  LockKeyhole,
  ShieldCheck
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PricingCard } from "@/components/PricingCard";
import { ContactForm } from "@/components/ContactForm";

const steps = [
  {
    title: "Elige tu formato",
    text: "Foto o vídeo: selecciona el pack adecuado y paga al instante con Stripe."
  },
  {
    title: "Envía tu material",
    text: "Sube tu producto, render o vídeo base de 1 minuto junto a la descripción de escena."
  },
  {
    title: "Recibe el resultado",
    text: "Entregamos las piezas listas para publicar directamente en tu email en menos de 24h."
  }
];

const assurances = [
  {
    icon: ShieldCheck,
    title: "Pago protegido",
    text: "Stripe verifica cada pedido antes de iniciar la producción."
  },
  {
    icon: LockKeyhole,
    title: "Material privado",
    text: "Tus archivos permanecen en almacenamiento privado y controlado."
  },
  {
    icon: Clock3,
    title: "Borrado programado",
    text: "El material de trabajo se elimina automáticamente tras la entrega."
  }
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <header className="header shell">
          <a className="brand" href="/" aria-label="ReelTwin.ai inicio">
            ReelTwin<span>.ai</span>
          </a>
          <nav className="nav" aria-label="Principal">
            <a href="#como-funciona">Proceso</a>
            <a href="#pricing">Precios</a>
            <a className="nav-action" href="#contacto">
              Hablemos
            </a>
          </nav>
        </header>

        <div className="hero-content shell">
          <p className="hero-eyebrow">
            Para fotógrafos y videógrafos profesionales
          </p>

          <h1 className="hero-headline font-display">
            Una sesión. <em>Diez entregables.</em>
          </h1>

          <p className="hero-sub">
            Tu trabajo, multiplicado. Convierte cada shoot en decenas
            de variaciones cinematográficas para tu cliente —
            sin volver al estudio, sin re-grabar, sin nueva agenda.
          </p>

          <div className="hero-ctas">
            <a href="#pricing" className="cta-primary">Ver precios</a>
            <a href="#demo" className="cta-secondary">Ver multiplicación</a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>Tú firmas</strong>
              <span>Tú haces la foto. Nosotros las variaciones.</span>
            </div>
            <div className="hero-stat">
              <strong>x10 por sesión</strong>
              <span>Decenas de entregables por shoot</span>
            </div>
            <div className="hero-stat">
              <strong>24h</strong>
              <span>Del archivo a las variaciones</span>
            </div>
          </div>
        </div>

        <div className="hero-visuals" aria-hidden="true">
          <div className="hero-visuals-inner">
            <div className="hero-vis-item">
              <Image alt="" fill priority sizes="(max-width: 900px) 0vw, 48vw" src="/mujer.jpeg" style={{ objectFit: "cover", objectPosition: "center 20%" }} />
            </div>
            <div className="hero-vis-item">
              <Image alt="" fill sizes="(max-width: 900px) 0vw, 48vw" src="/sillon.jpeg" style={{ objectFit: "cover" }} />
            </div>
            <div className="hero-vis-item">
              <Image alt="" fill sizes="(max-width: 900px) 0vw, 48vw" src="/taza.jpeg" style={{ objectFit: "cover" }} />
            </div>
          </div>
          <div className="hero-visuals-fade" />
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

      <section className="audience shell">
        <p className="section-eyebrow">Para quién</p>
        <h2 className="section-headline font-display">
          Un único oficio. Tres formas de multiplicar.
        </h2>

        <div className="audience-grid">
          <article className="audience-card">
            <span className="card-num">01</span>
            <h3>Fotógrafo de producto</h3>
            <p>
              Cada SKU en diez escenarios, texturas y ambientes
              desde una sola toma limpia.
            </p>
          </article>

          <article className="audience-card">
            <span className="card-num">02</span>
            <h3>Fotógrafo de interior</h3>
            <p>
              El mismo espacio, distintas atmósferas, mobiliario y luz.
              Staging virtual sin decoración física.
            </p>
          </article>

          <article className="audience-card">
            <span className="card-num">03</span>
            <h3>Videógrafo y productora</h3>
            <p>
              Un día de rodaje convertido en clips para semanas de
              campaña. Más entregables, mismo material base.
            </p>
          </article>
        </div>
      </section>

      <section className="demo shell" id="demo">
        <BeforeAfterSlider />
        <div className="demo-caption">
          <p>
            Mismo material base. Nuevo universo visual. Foto y vídeo de nivel editorial
            listos para publicar.
          </p>
        </div>
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

      <section className="manifesto">
        <h2 className="manifesto-headline font-display">
          Tú sigues siendo el autor.
        </h2>
        <p className="manifesto-body">
          No venimos a sustituirte. Venimos a darte palancas.
          Tu sesión sigue siendo tuya — nosotros sólo multiplicamos
          lo que ya hiciste bien, para que un día de rodaje rinda
          como diez.
        </p>
      </section>


      <section className="pricing shell" id="pricing">
        <div className="section-heading pricing-heading">
          <div>
            <p className="eyebrow">Pago único</p>
            <h2>Elige tu formato.</h2>
            <p className="section-copy">
              Sin suscripciones ni registro previo. Selecciona foto o vídeo y
              empieza a crear.
            </p>
          </div>
        </div>
        <div className="pricing-grid">
          <PricingCard packageId="foto" />
          <PricingCard packageId="monologo" />
          <PricingCard packageId="showcase" featured />
        </div>
      </section>

      <section className="assurance">
        <div className="shell assurance-grid">
          {assurances.map(({ icon: Icon, title, text }) => (
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
            <p className="eyebrow">Proyectos a medida</p>
            <h2>
              Cuéntanos
              <br />
              tu proyecto.
            </h2>
            <p>
              Para proyectos mayores o necesidades específicas. Revisamos tu caso
              y respondemos en menos de 24 horas con una propuesta concreta.
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
          <span>Producción de imagen y vídeo con IA para empresas</span>
          <span>© Carlos Makes, 2026</span>
        </div>
        <span>Entrega en 24h</span>
      </footer>
    </main>
  );
}
