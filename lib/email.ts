import { Resend } from "resend";

interface SendEmailParams {
  to: string;
  finalVideoUrl: string;
  orderReference: string;
}

export async function sendDeliveryEmail({ to, finalVideoUrl, orderReference }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "entregas@carlosmakes.com";

  if (!apiKey || apiKey === "re_replace" || apiKey.includes("test_")) {
    console.log("=========================================");
    console.log("[MOCK EMAIL] Resend API Key is not configured or in mock/test environment.");
    console.log(`To: ${to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: Tu reel está listo`);
    console.log(`Order Reference: ${orderReference}`);
    console.log(`Download URL: ${finalVideoUrl}`);
    console.log("Body:");
    console.log(`¡Hola!\n\nTu reel personalizado para el pedido ${orderReference} ya está listo y procesado.\n\nPuedes descargarlo directamente en el siguiente enlace:\n${finalVideoUrl}\n\nNota: Este enlace de descarga expirará en 30 días.\n\nUn saludo,\nEl equipo de ReelTwin.ai`);
    console.log("=========================================");
    return { success: true, mock: true };
  }

  const resend = new Resend(apiKey);

  const subject = "Tu reel está listo";
  const textContent = `¡Hola!

Tu reel personalizado para el pedido ${orderReference} ya está listo y procesado.

Puedes descargarlo directamente en el siguiente enlace:
${finalVideoUrl}

Nota: Este enlace de descarga expirará en 30 días.

Un saludo,
El equipo de ReelTwin.ai`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu reel está listo</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #08090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #12161a; border: 1px solid #20262c; border-radius: 8px; margin-top: 40px; padding: 40px 24px;">
        <tr>
          <td>
            <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 24px; font-family: sans-serif;">Tu reel está listo</h1>
            <p style="font-size: 16px; line-height: 1.5; color: #a1a1aa; margin-bottom: 24px;">
              ¡Hola! Tu reel personalizado para el pedido <strong>${orderReference}</strong> ya está completamente procesado y listo para descargar.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
              <tr>
                <td align="center" style="border-radius: 4px; background-color: #d7ff54;">
                  <a href="${finalVideoUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: sans-serif; font-size: 16px; font-weight: bold; color: #08090b; text-decoration: none; border-radius: 4px;">
                    Descargar Reel
                  </a>
                </td>
              </tr>
            </table>
            <p style="font-size: 14px; line-height: 1.5; color: #71717a; margin-bottom: 24px;">
              Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:<br>
              <a href="${finalVideoUrl}" style="color: #53d7c2; text-decoration: underline;">${finalVideoUrl}</a>
            </p>
            <p style="font-size: 12px; color: #71717a; border-top: 1px solid #20262c; padding-top: 16px; margin-top: 32px;">
              Nota importante: Este enlace de descarga expirará en 30 días. Por favor, descarga tu archivo antes de esa fecha.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend API returned an error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email via Resend:", error);
    return { success: false, error };
  }
}
