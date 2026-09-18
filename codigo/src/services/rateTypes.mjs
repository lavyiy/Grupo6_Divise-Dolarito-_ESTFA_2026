export function isCrypto(rate) {
  const type = String(rate.tipo ?? '').toLowerCase();
  if (type === 'crypto' || type === 'cripto') return true;
  if (type === 'fiat') return false;
  // Compatibilidad con respuestas antiguas sin categoria de activo.
  return ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'DOGE'].includes(rate.codigo);
}
