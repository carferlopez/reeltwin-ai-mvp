# Operator Runbook — ReelTwin.ai

Este documento detalla los procesos operativos y técnicos de ReelTwin.ai para que tú (Carlos) en 6 meses puedas gestionar, desplegar y escalar este MVP sin fricciones.

---

## 1. Arquitectura & Flujo de Datos
ReelTwin.ai es un MVP transaccional sin registro de usuario. El ciclo de vida de un pedido es el siguiente:
1. **Compra**: El cliente paga en Stripe a través de un **Stripe Payment Link** de un pack (`monologo` o `showcase`).
2. **Redirección de Stripe**: Stripe redirige al cliente a `/intake?session_id={CHECKOUT_SESSION_ID}`.
3. **Formulario de Admisión**: `/intake` valida la sesión de Stripe en el servidor y muestra `ReelForm`.
4. **Carga Segura (Proxy upload)**: El vídeo base del cliente se sube de forma asíncrona mediante un proxy serverless en `/api/process-reel` a un bucket privado de Supabase Storage (`raw-videos`), evitando bloqueos de CORS en el navegador.
5. **Generación Instantánea**: `/api/process-instant` orquesta la llamada a Gemini Omni (o simulación), sube el vídeo final al bucket público `completed-reels` y marca la orden como `completed`.
6. **Entrega**: El sistema envía un correo transaccional automático al comprador mediante la API de **Resend** con el enlace de descarga directo (válido por 30 días).

---

## 2. Variables de Entorno (Environment Variables)
Copia este bloque en tu archivo `.env.local` para desarrollo local o añádelas a tu dashboard de Vercel para producción:

```bash
# Configuración del Sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Enlaces de Pago de Stripe (con metadata package_id=monologo o package_id=showcase)
NEXT_PUBLIC_STRIPE_PRO_LINK=https://buy.stripe.com/test_3cIbIUfJrfjFba838K2cg01
NEXT_PUBLIC_STRIPE_STUDIO_LINK=https://buy.stripe.com/test_cNi00cgNv5J52DC6kW2cg00

# Base de Datos y Almacenamiento Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-super-secreta
SUPABASE_STORAGE_BUCKET=training-videos

# Supabase Keys Públicas (Usadas en el lado del cliente)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica

# Pasarela Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Envío de Emails (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=entregas@carlosmakes.com

# Motores de Inteligencia Artificial (Opcional — Activan Producción Real)
GEMINI_API_KEY=AIzaSy...                  # Si falta, activa simulación Gemini
REPLICATE_API_TOKEN=r8_...                # Si está presente, activa render en Luma Dream Machine
NEXT_PUBLIC_VIDEO_SIMULATION=true         # Forzar simulación de vídeo incluso con claves puestas
```

---

## 3. Modo Sandbox Local (Sin Credenciales)
Si eliminas o dejas por defecto `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en tu `.env.local`, el sistema entra automáticamente en **Modo Sandbox Local** (Mock Mode):
- **Base de Datos Local**: Se usa un archivo JSON plano en `scratch/mock_db.json` como base de datos local.
- **Almacenamiento Local**: Los archivos subidos se guardan localmente en `public/mock-storage/raw-videos/{sessionId}/video.mp4`.
- **Vídeos de Prueba**: En lugar de llamar a la IA, copia vídeos stock predefinidos desde `public/mock-samples/` a `public/mock-storage/completed-reels/{sessionId}/completed.mp4`.
- **Reset de Pruebas**: Visita `http://localhost:3000/api/create-test-order` en tu navegador. Esto creará un pedido de prueba pagado (`test-order-instant-magic`) en tu JSON local y te redirigirá directamente al formulario para probar el flujo sin pasar por Stripe.

---

## 4. Gestión de Base de Datos Supabase & Migraciones
La base de datos utiliza Row Level Security (RLS) muy estricto: **ningún usuario público puede leer ni escribir en las tablas directamente**. Todas las consultas se realizan desde rutas API server-side utilizando `SUPABASE_SERVICE_ROLE_KEY`.

### Inicializar Esquema de Base de Datos:
1. Entra en tu panel de Supabase.
2. Ve a **SQL Editor**.
3. Pega y ejecuta el contenido de `supabase/schema.sql` para crear las tablas `orders`, `intakes`, `subscriptions` y los buckets de almacenamiento (`raw-videos`, `completed-reels`).
4. Si necesitas aplicar la columna de aceptación legal de responsabilidad, ejecuta la migración `supabase/migrations/002_liability.sql`:
```sql
ALTER TABLE intakes ADD COLUMN IF NOT EXISTS liability_accepted_at timestamptz not null default now();
```

---

## 5. Pruebas de Webhooks de Stripe en Local
Para verificar que los pagos de Stripe registran correctamente los pedidos en tu base de datos local o de Supabase en tiempo de desarrollo:

1. Instala el CLI de Stripe y haz login:
   ```bash
   stripe login
   ```
2. Redirige los webhooks de Stripe al puerto local de tu servidor Next.js:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. El CLI te devolverá un secreto de webhook parecido a `whsec_...`. Cópialo y ponlo como `STRIPE_WEBHOOK_SECRET` en tu `.env.local`.
4. En otra terminal, lanza un evento de test para comprobar que impacta:
   ```bash
   stripe trigger checkout.session.completed
   ```

---

## 6. Despliegue en Producción (Vercel)
Este MVP está diseñado para desplegarse en **Vercel** de forma nativa en menos de 2 minutos:

1. Sube tu repositorio a GitHub.
2. En el panel de Vercel, añade un nuevo proyecto e importa el repositorio.
3. Asegúrate de añadir todas las variables de entorno listadas en la sección 2 del Runbook.
4. **Cron Job de Purga de Almacenamiento**: Configura un Cron Job en `vercel.json` o en la pestaña de Cron de Vercel para ejecutar la limpieza automática de vídeos de entrenamiento (TTL de 7 días) cada 24h:
   ```bash
   npm run purge:training-videos
   ```

---

## 7. Añadir Nuevos Estilos Cinematográficos (Cinematic Franchise)
Los estilos visuales están centralizados en `config/styles.ts`. Para añadir un nuevo estilo visual a la plataforma (por ejemplo: `neon-cyberpunk`), simplemente abre `config/styles.ts` y añade una nueva entrada con la siguiente estructura exacta:

```typescript
export const CINEMATIC_STYLES = {
  // Estilos existentes...
  "neon-cyberpunk": {
    name: "Neon Cyberpunk",
    description: "Atmósfera nocturna urbana inspirada en películas de ciencia ficción de los 80, lluvia tenue, luces de neón reflejadas y sombras muy marcadas.",
    dynamicBackgrounds: [
      "dystopian city alleyway at night, neon signs glowing in pink and cyan, wet asphalt reflection",
      "cyberpunk laboratory filled with holograms and terminal screens, dim cobalt accent lighting",
      "futuristic penthouse overlooking a megacity under heavy rain, high-contrast silhouette edges"
    ]
  }
};
```

Al guardarse, el selector visual de `ReelForm.tsx` renderizará automáticamente una nueva tarjeta para que el cliente elija este estilo, y el endpoint de procesamiento del servidor `/api/process-instant` seleccionará de forma aleatoria uno de los fondos para componer el prompt final para la IA.
