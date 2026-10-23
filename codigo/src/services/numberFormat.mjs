// ── src/services/numberFormat.mjs ───────────────────────────────────────────
// Formato numérico argentino determinístico: punto (.) para miles y coma (,)
// para decimales, sin depender del locale/ICU del navegador.
//
// Reglas:
// - Miles: punto en grupos de 3 dígitos (1.234.567).
// - Decimales: una sola coma (1.234,56).
// - La coma NUNCA se usa para separar miles y el punto NUNCA para decimales.

/**
 * Formatea un número con separador de miles '.' y separador decimal ','.
 * Ej: 12980.235 -> "12.980,235" (según la cantidad de decimales pedida).
 * @param {number|string} value
 * @param {{ decimals?: number, minDecimals?: number }} options
 */
export function formatAmount(value, { decimals = 2, minDecimals = 0 } = {}) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';

  const maxDecimals = Math.max(0, Math.min(20, Math.trunc(decimals)));
  const min = Math.max(0, Math.min(maxDecimals, Math.trunc(minDecimals)));

  // toFixed evita depender del locale/ICU del navegador: siempre usamos
  // punto para miles y coma para decimales, sin importar el sistema operativo.
  const fixed = Math.abs(num).toFixed(maxDecimals);
  let [integerPart, decimalPart = ''] = fixed.split('.');

  while (decimalPart.length > min && decimalPart.endsWith('0')) {
    decimalPart = decimalPart.slice(0, -1);
  }

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = num < 0 ? '-' : '';
  return `${sign}${integerPart}${decimalPart ? `,${decimalPart}` : ''}`;
}

/**
 * Formatea el monto para mostrarlo dentro de un input:
 * puntos para miles y una sola coma para decimales. Ej: "12.980,50".
 * Si el valor no es válido, devuelve el texto original sin modificarlo.
 * @param {string|number} raw
 * @param {number} maxDecimals
 */
export function formatAmountInput(raw, maxDecimals = 6) {
  const parsed = parseArgentineNumber(raw);
  if (!parsed.ok) return String(raw == null ? '' : raw).trim();

  const [integerPart, decimalPart] = parsed.normalized.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decimalPart !== undefined) {
    // Conserva los decimales tal como los escribió el usuario (ej: 1.000,50),
    // limitados al máximo permitido.
    const decimals = decimalPart.slice(0, maxDecimals);
    return decimals ? `${grouped},${decimals}` : grouped;
  }
  return grouped;
}

/**
 * Parsea montos ingresados por el usuario con formato argentino estricto:
 * - Punto (.) únicamente como separador de miles en grupos de 3 dígitos.
 * - Coma (,) únicamente como separador decimal (máximo una).
 *
 * Ejemplos válidos: "15.000", "15.000.000,50", "12.980,235", "12980,5".
 * Ejemplos inválidos: "12,980,235" (varias comas), "12.5" (punto decimal),
 * "12.50" (punto decimal) o "1.23" (grupo de miles incompleto).
 *
 * @param {string|number} raw
 * @returns {{ ok: boolean, value?: number, error?: string, normalized?: string }}
 */
export function parseArgentineNumber(raw) {
  const value = String(raw == null ? '' : raw).trim();
  if (!value) return { ok: false, error: 'Ingresá un monto para convertir.' };

  // Elimina prefijo de moneda y espacios: ej "$ 15.000.000"
  let cleaned = value.replace(/^\s*\$?\s*/, '').replace(/\s+/g, '').trim();
  if (!cleaned) return { ok: false, error: 'Ingresá un monto para convertir.' };

  if (!/^[0-9.,]+$/.test(cleaned)) {
    return {
      ok: false,
      error: 'El monto debe contener solo números, puntos para miles y coma para decimales.',
    };
  }

  // Permite separadores finales incompletos mientras se escribe: "12." o "12,"
  if (cleaned.length > 1 && (cleaned.endsWith('.') || cleaned.endsWith(','))) {
    cleaned = cleaned.slice(0, -1);
  }

  const commaCount = (cleaned.match(/,/g) || []).length;
  if (commaCount > 1) {
    return {
      ok: false,
      error: 'Usá una sola coma para los decimales. Ej: 12.980,50.',
    };
  }

  let integerPart = cleaned;
  let decimalPart = '';

  if (commaCount === 1) {
    const commaIndex = cleaned.indexOf(',');
    integerPart = cleaned.slice(0, commaIndex);
    decimalPart = cleaned.slice(commaIndex + 1);

    if (decimalPart && !/^\d+$/.test(decimalPart)) {
      return {
        ok: false,
        error: 'Después de la coma solo pueden ir números. Ej: 12.980,50.',
      };
    }
    if (decimalPart.length > 6) {
      return { ok: false, error: 'Ingresá como máximo 6 decimales.' };
    }
  }

  if (!integerPart) integerPart = '0';
  if (!/^\d+$/.test(integerPart.replace(/\./g, ''))) {
    return { ok: false, error: 'El monto ingresado no es un número válido.' };
  }

  // Los puntos solo pueden separar miles en grupos de 3 dígitos.
  if (integerPart.includes('.')) {
    const groups = integerPart.split('.');
    const validGroups =
      groups.length > 1 &&
      /^\d{1,3}$/.test(groups[0]) &&
      groups.slice(1).every((group) => /^\d{3}$/.test(group));

    if (!validGroups) {
      return {
        ok: false,
        error: 'Los puntos separan miles en grupos de 3 dígitos. Para decimales usá coma. Ej: 12.980,50.',
      };
    }
  }

  const normalized = `${integerPart.replace(/\./g, '')}${decimalPart ? `.${decimalPart}` : ''}`;
  const num = Number(normalized);
  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return { ok: false, error: 'El monto ingresado no es un número válido.' };
  }
  if (num < 0) {
    return { ok: false, error: 'El monto no puede ser negativo.' };
  }
  return { ok: true, value: num, normalized };
}
