# ESPECIFICACIÓN TÉCNICA DEL BLOQUE (JSON CONFIG)

```json
{
  "module_name": "PostPaymentDataCapture",
  "architecture": {
    "frontend_component": "/components/ReelForm.jsx",
    "api_route": "/app/api/process-reel/route.js",
    "config_file": "/config/styles.js"
  },
  "stack": {
    "framework": "Next.js 14+ (App Router)",
    "styling": "Tailwind CSS",
    "database_and_storage": "Supabase (PostgreSQL + Storage Buckets)"
  }
}
```

---

# INSTRUCCIONES DE PROGRAMACIÓN DETALLADAS

## Paso 1: El Archivo de Configuración de Estilos (`/config/styles.js`)
Define la "Franquicia Cinematográfica" con parámetros fijos de iluminación y arrays de fondos dinámicos.

## Paso 2: El Componente Frontend (`/components/ReelForm.jsx`)
Crea un formulario modular y estilizado con Tailwind CSS oscuro (`bg-slate-900`, `text-white`) que:
- Lee `session_id` de la URL usando `useSearchParams`.
- Presenta el selector de estilo en tarjetas interactivas de alto contraste.
- Dispone de un textarea para el guion (máximo 500 caracteres).
- Incluye una zona de carga Drag & Drop asíncrona para subir el vídeo base a Supabase Storage en el bucket `raw-videos` en la ruta `session_id/video.mp4` mediante URL firmada segura.
- Ofrece estados visuales claros durante el ciclo de vida: `"Cargando vídeo..."`, `"Procesando..."` y `"¡Éxito! Tu reel estará listo en 24h."`.

## Paso 3: La Ruta de la API (`/app/api/process-reel/route.js`)
Implementa un endpoint POST que reciba el JSON con los datos del formulario (`sessionId`, `selectedStyle`, `videoUrl`, `scriptText`), valide con Zod, actualice el estado del pedido en la tabla `orders` a `data_received`, y ejecute la lógica de fondos dinámicos y semillas aleatorias imprimiendo el payload listo para la IA en el `console.log` del servidor.

## Paso 4: Seguridad y Robustez
- Validación de datos exhaustiva y estricta en el servidor con esquemas Zod antes de operar sobre la base de datos.
- Uso de variables de entorno seguras (`SUPABASE_SERVICE_ROLE_KEY` del lado del servidor).
- Cero claves privadas expuestas en la parte del cliente.
