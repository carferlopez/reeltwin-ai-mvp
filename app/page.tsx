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
    title: "Selecciona",
    text: "Elige un clip o tres escenas y paga al instante con Stripe."
  },
  {
    title: "Interpreta",
    text: "Sube un vídeo base de un minuto y escribe tu escena."
  },
  {
    title: "Recibe",
    text: "Producimos tu gemelo digital y entregamos por email en 24h."
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
            <a href="#pricing">Precios</a>
            <a className="nav-action" href="#pricing">
              Crear clip
            </a>
          </nav>
        </header>

        <div className="hero-copy shell">
          <p className="eyebrow">Gemelos digitales para performers</p>
          <h1>
            No puedes estar en dos sitios a la vez... <em>¿o sí?</em>
          </h1>
          <p className="hero-description">
            Multiplica tu presencia en vídeo en reels, redes sociales, clases online y cualquier
            pieza en la que muestres tu cara y tu cuerpo, con un gemelo digital indistinguible de tu yo real.
          </p>
          <div className="hero-actions">
            <a className="button-primary" href="#pricing">
              Crear por 29 €
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
            <strong>10 segundos</strong>
            <span>Clip final</span>
          </div>
          <div>
            <strong>24 horas</strong>
            <span>Entrega</span>
          </div>
          <div>
            <strong>Sin cuenta</strong>
            <span>Pago y subida directa</span>
          </div>
        </div>
      </section>

      <section className="statement shell">
        <p className="eyebrow">Tu próxima escena</p>
        <h2>
          Un minuto frente a cámara.
          <br />
          Una imagen que abre puertas.
        </h2>
      </section>

      <section className="demo shell" id="demo">
        <BeforeAfterSlider />
        <div className="demo-caption">
          <p>
            Mismo intérprete. Nuevo universo visual. Voz clonada y dirección
            cinematográfica en una pieza preparada para publicar.
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
            <h2>Elige tu escena.</h2>
          </div>
          <p className="section-copy">
            Sin suscripciones ni registro previo. Selecciona un formato y
            empieza a crear.
          </p>
        </div>
        <div className="pricing-grid">
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
          Tu próxima escena
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
        <span>Clips cinematográficos con gemelos digitales</span>
        <span>Entrega en 24h</span>
      </footer>
    </main>
  );
}
