# Handoff de sesión — ReelTwin.ai

Documento para retomar el trabajo en un nuevo chat. Última actualización: 2026-05-25.

---

## Estado actual del proyecto

Next.js 15 + Supabase + Stripe + Gemini Omni. El flujo completo está implementado y funciona en modo sandbox local (sin credenciales). Ver `CLAUDE.md` para la arquitectura completa.

**Para arrancar en local sin configurar nada:**
```
npm install && npm run dev
# luego visita: http://localhost:3000/api/create-test-order
```

---

## Lo que se hizo en esta sesión

### 1. CLAUDE.md creado
`/CLAUDE.md` — documenta toda la arquitectura, comandos, variables de entorno, esquema de base de datos y design tokens. Leerlo es suficiente para entender el proyecto completo.

### 2. Hero sustituido con las 3 imágenes
Se reemplazó el hero anterior (imagen única `/reeltwin-hero.png`) por un **layout split**:
- Izquierda: texto/copy (header, headline, CTAs, stats)
- Derecha: panel con 3 imágenes apiladas en triptych vertical

**Archivos modificados:**
- `app/page.tsx` — nueva estructura JSX con `.hero-visuals` + `.hero-vis-item`
- `app/globals.css` — nuevas clases `.hero-visuals`, `.hero-visuals-inner`, `.hero-vis-item`, `.hero-visuals-fade`; eliminadas `.hero-image` y `.hero-overlay`
- `public/mujer.jpeg`, `public/sillon.jpeg`, `public/taza.jpeg` — imágenes copiadas desde raíz del proyecto

---

## Trabajo pendiente — Hero visual

### Problema identificado
`sillon.jpeg` muestra suelo de hormigón crudo que baja el tono de la marca. Las otras dos imágenes (mujer, taza) sí son conceptuales y elegantes.

### Dirección acordada: tarjetas conceptuales "objeto emergiendo de la oscuridad"
Tres tarjetas, cada una con un objeto diferente, mismo tratamiento: oscuridad total a la izquierda, objeto perfectamente iluminado emergiendo a la derecha. Representan los sectores del cliente sin decirlo explícitamente.

**Prompts para generar (Midjourney / DALL-E 3 / Ideogram):**

**Tarjeta 1 — Producto (taza — ya existe como taza.jpeg, es válida)**
```
Cinematic dark studio. A minimalist white ceramic mug emerging from pure 
darkness on the right side. Single dramatic overhead spotlight, perfect 
product photography lighting, rich shadows, hyperrealistic texture. 
Left side pure black. Square format 1:1. Luxury commercial photography.
```

**Tarjeta 2 — Espacio (reemplazar sillon.jpeg)**
```
Cinematic dark studio. A single elegant armchair in warm amber velvet fabric 
emerging from pure darkness on the right side. Dramatic side lighting casting 
long shadows, perfect interior photography quality. NO concrete floor visible — 
deep black void below. Left side pure black. Square format 1:1. Editorial luxury style.
```

**Tarjeta 3 — Persona (mujer — ya existe como mujer.jpeg, es válida)**
```
Cinematic dark portrait studio. A professional woman in her 30s emerging 
from pure darkness on the right side, looking slightly off-camera. 
Single dramatic Rembrandt lighting on her face. Sharp, editorial, 
commercial portrait quality. Left side pure black. Square format 1:1.
```

### Cómo actualizar cuando tengas las imágenes
1. Guarda las nuevas imágenes en `public/` (por ejemplo `sillon-v2.jpeg`)
2. En `app/page.tsx`, cambia el `src` del segundo `hero-vis-item`:
   ```tsx
   <Image alt="" fill sizes="(max-width: 900px) 0vw, 48vw" src="/sillon-v2.jpeg" style={{ objectFit: "cover" }} />
   ```

### Layout de tarjetas alternativo (si quieres sección dedicada)
En lugar del triptych como fondo del hero, se habló de mostrarlas como **3 tarjetas en fila horizontal** entre el hero y la sección "Cómo funciona". Con bordes redondeados y hover effect sutil. Pendiente de decidir si va en el hero o en sección propia.

---

## Decisiones de diseño tomadas

- **Tono visual**: oscuridad cinematográfica, no suciedad industrial. El fondo `ink` (#08090b) y las imágenes deben ser elegantes, no crudas.
- **Las 3 imágenes representan**: objeto (producto), espacio (interior), persona (performer) — los tres perfiles de cliente sin texto explícito.
- **Fade gradiente**: el panel de imágenes tiene un fade de izquierda a derecha (`hero-visuals-fade`) que asegura legibilidad del texto en desktop.
- **Mobile**: el panel de imágenes se oculta completamente en ≤900px.

---

## Design tokens Tailwind (referencia rápida)

| Token | Hex |
|---|---|
| `ink` | #08090b |
| `steel` | #12161a |
| `signal` | #d7ff54 (amarillo lima — CTA) |
| `mint` | #53d7c2 (cian — sandbox/mock UI) |
| `danger` | #ff6666 |
| `zinc` | #20262c (bordes) |
