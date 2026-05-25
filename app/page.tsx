import Image from "next/image";
import {
  ArrowRight,
  Clock3,
  LockKeyhole,
  Play,
  ShieldCheck
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { PricingCard } from "@/components/PricingCard";

const process = [
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

const sectors = [
  {
    number: "01",
    title: "Producto",
    subtitle: "E-commerce y retail",
    description: "Genera decenas de fotos de producto en escenarios, texturas y ambientes diferentes. Sin organizar otra sesión de fotos.",
    tags: ["Foto", "Vídeo"]
  },
  {
    number: "02",
    title: "Espacio",
    subtitle: "Arquitectura e interiorismo",
    description: "Transforma renders vacíos en espacios habitados. Añade personas y atmósferas que venden el proyecto antes de construirlo.",
    tags: ["Foto", "Render"]
  },
  {
    number: "03",
    title: "Formador",
    subtitle: "E-learning y cursos online",
    description: "Graba tu gemelo digital en múltiples escenas y estilos desde un único vídeo base. Contenido para meses en una tarde.",
    tags: ["Vídeo", "Clip"]
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
    text: "Tus vídeos permanecen en almacenamiento privado y controlado."
  },
  {
    icon: Clock3,
    title: "Borrado programado",
    text: "El vídeo de entrenamiento se elimina tras la entrega."
  }
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
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

        <header className="header shell">
          <a className="brand" href="/" aria-label="ReelTwin.ai inicio">
            ReelTwin<span>.ai</span>
          </a>
          <nav className="nav" aria-label="Principal">
            <a href="#como-funciona">Proceso</a>
            <a href="#pricing">Precios</a>
            <a className="nav-action" href="#pricing">
              Crear clip
            </a>
          </nav>
        </header>

        <div className="hero-copy shell">
          <p className="eyebrow">E-commerce · Arquitectura · Formación</p>
          <h1>
            Foto y vídeo<br />de estudio.{" "}
            <em>Sin estudio.</em>
          </h1>
          <p className="hero-description">
            Genera contenido visual de nivel editorial para tus productos, espacios y formadores.
            Sin alquilar estudio, sin sesión de fotos, sin esperar semanas.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#pricing">
              Ver precios
              <ArrowRight />
            </a>
            <a className="button-play" href="#demo">
              <Play />
              Ver transformación
            </a>
          </div>
        </div>

        <div className="hero-stats shell" aria-label="Características principales">
          <div>
            <strong>Foto + Vídeo</strong>
            <span>Contenido dual</span>
          </div>
          <div>
            <strong>24 horas</strong>
            <span>Entrega</span>
          </div>
          <div>
            <strong>Sin rodaje</strong>
            <span>Solo tu material base</span>
          </div>
        </div>
      </section>

      <section className="statement shell">
        <p className="eyebrow">Tu próximo proyecto</p>
        <h2>
          La IA no te sustituye.
          <br />
          Te multiplica.
        </h2>
      </section>

      <section className="sectors shell" id="sectores">
        <div className="section-heading">
          <p className="eyebrow">Para quién</p>
          <h2>Tres sectores, un proceso.</h2>
        </div>
        <div className="sectors-grid">
          {sectors.map((s) => (
            <article className="sector-card" key={s.title}>
              <span className="sector-number">{s.number}</span>
              <h3>{s.title}</h3>
              <p className="sector-subtitle">{s.subtitle}</p>
              <p>{s.description}</p>
              <div className="sector-tags">
                {s.tags.map((tag) => (
                  <span className="sector-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
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
            {process.map((step, index) => (
              <article className="step" key={step.title}>
                <span>0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
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

      <section className="closing shell">
        <h2>
          Tu próximo proyecto
          <br />
          empieza aquí.
        </h2>
        <a className="button-primary" href="#pricing">
          Elegir pack
          <ArrowRight />
        </a>
      </section>

      <footer className="footer shell">
        <span className="brand">
          ReelTwin<span>.ai</span>
        </span>
        <div className="footer-info">
          <span>Clips cinematográficos con gemelos digitales</span>
          <span>© Carlos Makes, 2026</span>
        </div>
        <span>Entrega en 24h</span>
      </footer>
    </main>
  );
}
