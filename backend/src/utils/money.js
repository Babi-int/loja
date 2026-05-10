/**
 * Utilitários monetários compartilhados pelos serviços (centavos estáveis com roundCurrency).
 */
function toNumber(value) {
  return Number(value || 0);
}

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/** Preço de venda = compra + (compra * lucro% / 100). Ver regra comercial no módulo de produtos. */
function calculateSalePrice(purchasePrice, profitPercentage) {
  const purchase = toNumber(purchasePrice);
  const profit = toNumber(profitPercentage);
  return roundCurrency(purchase + purchase * (profit / 100));
}

module.exports = {
  calculateSalePrice,
  roundCurrency,
  toNumber
};
