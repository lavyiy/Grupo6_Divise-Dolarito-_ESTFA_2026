// ── server/services/whatsappService.js ───────────────────────────────────────
// Envío de mensajes de WhatsApp vía CallMeBot (https://www.callmebot.com).
// API gratuita para uso personal: cada usuario se da de alta una sola vez
// mandando "I allow callmebot to send me messages" al bot (+34 623 91 22 04)
// y recibe su apikey. Configuración guardada en la tabla usuarios.

/**
 * Envía un mensaje de WhatsApp al propio usuario.
 * @param {string} phone   Número con código de país, ej: +5491122334455
 * @param {string} apiKey  API key personal que entrega CallMeBot
 * @param {string} text    Mensaje (texto plano, se codifica solo)
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
async function sendWhatsApp(phone, apiKey, text) {
  if (!phone || !apiKey) {
    return { ok: false, error: 'WhatsApp no configurado para este usuario' };
  }

  // Normalizamos: dejamos solo dígitos y el + inicial
  const normalized = '+' + String(phone).replace(/[^\d]/g, '');

  const url =
    'https://api.callmebot.com/whatsapp.php' +
    `?phone=${encodeURIComponent(normalized)}` +
    `&text=${encodeURIComponent(text)}` +
    `&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[WHATSAPP] Error de CallMeBot:', res.status, await res.text().catch(() => ''));
      return { ok: false, error: `CallMeBot respondió ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error('[WHATSAPP] Error de red:', err.message);
    return { ok: false, error: err.message };
  }
}

module.exports = { sendWhatsApp };
