const PAYMENT_METHOD_LABELS = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  DEBITO: "Debito",
  CREDITO: "Credito"
};

/** Rotulo para exibir metodo gravado na venda (API / registrar venda). */
export function formatPaymentMethod(code) {
  if (!code) return "-";
  return PAYMENT_METHOD_LABELS[String(code)] || String(code);
}

/** Alinhado ao backend (money.roundCurrency). */
export function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

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
