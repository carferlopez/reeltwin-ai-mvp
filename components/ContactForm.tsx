"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error();
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="contact-success">
        <p>Recibido. Te escribimos en menos de 24 horas.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            required
            type="text"
            autoComplete="name"
            className="form-input"
          />
        </div>
        <div className="form-field">
          <label htmlFor="company">Empresa</label>
          <input
            id="company"
            name="company"
            required
            type="text"
            autoComplete="organization"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="email">Email de trabajo</label>
        <input
          id="email"
          name="email"
          required
          type="email"
          autoComplete="email"
          className="form-input"
        />
      </div>

      <div className="form-field">
        <label htmlFor="project">Cuéntanos tu proyecto</label>
        <textarea
          id="project"
          name="project"
          required
          rows={5}
          maxLength={1000}
          className="form-textarea"
          placeholder="Qué necesitáis, para qué canal, con qué frecuencia..."
        />
      </div>

      {state === "error" && (
        <p className="form-error">
          Algo ha fallado. Prueba de nuevo o escríbenos directamente.
        </p>
      )}

      <button
        type="submit"
        className="button-primary form-submit"
        disabled={state === "loading"}
      >
        {state === "loading" ? "Enviando..." : "Enviar"}
        <ArrowRight />
      </button>
    </form>
  );
}
