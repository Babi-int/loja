export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

export function calculateSalePrice(purchasePrice, profitPercentage) {
  const purchase = Number(purchasePrice || 0);
  const profit = Number(profitPercentage || 0);
  return purchase + purchase * (profit / 100);
}
