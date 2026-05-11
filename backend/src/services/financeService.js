const { db } = require("../database/firebase");
const { roundCurrency, toNumber } = require("../utils/money");
const settingsService = require("./settingsService");

const productsRef = db.collection("products");
const salesRef = db.collection("sales");

function saleStatus(sale) {
  return sale.status || "COMPLETED";
}

function isCancelled(sale) {
  return saleStatus(sale) === "CANCELLED";
}

function returnedQtyByProduct(sale) {
  const map = {};
  for (const ret of sale.returns || []) {
    for (const l of ret.lines || []) {
      map[l.productId] = (map[l.productId] || 0) + Number(l.quantity);
    }
  }
  return map;
}

/** Receita líquida da venda (desconta itens já devolvidos; cancelada = 0). */
function saleEffectiveTotalAmount(sale) {
  if (isCancelled(sale)) return 0;
  let returned = 0;
  for (const ret of sale.returns || []) {
    for (const l of ret.lines || []) {
      returned += toNumber(l.unitSalePrice) * Number(l.quantity);
    }
  }
  return roundCurrency(toNumber(sale.totalAmount) - returned);
}

/** Lucro estimado após devoluções parciais; desconto da venda mantido integral (MVP). */
function saleEffectiveProfit(sale) {
  if (isCancelled(sale)) return 0;
  const retMap = returnedQtyByProduct(sale);
  let itemsProfit = 0;
  for (const item of sale.items || []) {
    const ret = retMap[item.productId] || 0;
    const netQty = item.quantity - ret;
    if (netQty <= 0) continue;
    itemsProfit += (toNumber(item.unitSalePrice) - toNumber(item.unitCostPrice)) * netQty;
  }
  return roundCurrency(itemsProfit - toNumber(sale.discount));
}

/** Limites do dia no fuso local do servidor (comparação com soldAt em ISO). */
function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function parseDateOnlyStart(isoDateStr) {
  // AAAA-MM-DD interpretado no horário local (meia-noite), alinhado ao filtro do dashboard no front.
  const [y, m, d] = String(isoDateStr)
    .split("-")
    .map((part) => parseInt(part, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseDateOnlyEnd(isoDateStr) {
  const [y, m, d] = String(isoDateStr)
    .split("-")
    .map((part) => parseInt(part, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

function defaultDashboardRange() {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfDay(now),
    startDate: formatDateOnly(startOfMonth(now)),
    endDate: formatDateOnly(now)
  };
}

function formatDateOnly(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function resolveDashboardDateRange(query = {}) {
  const startRaw = query.startDate;
  const endRaw = query.endDate;

  if ((!startRaw || !endRaw) && (startRaw || endRaw)) {
    const error = new Error("Informe data inicial e data final, ou deixe as duas vazias para o periodo padrao.");
    error.statusCode = 400;
    throw error;
  }

  if (!startRaw && !endRaw) {
    return defaultDashboardRange();
  }

  const start = parseDateOnlyStart(startRaw);
  const end = parseDateOnlyEnd(endRaw);

  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const error = new Error("Datas invalidas. Use o formato AAAA-MM-DD.");
    error.statusCode = 400;
    throw error;
  }

  if (start > end) {
    const error = new Error("A data inicial nao pode ser maior que a data final.");
    error.statusCode = 400;
    throw error;
  }

  return {
    start,
    end,
    startDate: startRaw,
    endDate: endRaw
  };
}

function profitForSales(salesList) {
  return roundCurrency(salesList.reduce((sum, sale) => sum + saleEffectiveProfit(sale), 0));
}

async function getFinanceSummary() {
  const today = startOfDay();
  const month = startOfMonth();
  const sales = await getAllSales();

  const dailySales = sales.filter((sale) => new Date(sale.soldAt) >= today);
  const monthlySales = sales.filter((sale) => new Date(sale.soldAt) >= month);

  const totalSoldToday = sumSales(dailySales);
  const totalSoldMonth = sumSales(monthlySales);
  const estimatedProfit = profitForSales(monthlySales);

  return {
    totalSoldToday,
    totalSoldMonth,
    estimatedProfit,
    salesCount: monthlySales.filter((s) => !isCancelled(s)).length,
    topProducts: getTopProducts(sales),
    paymentMethods: getPaymentMethods(monthlySales.filter((s) => !isCancelled(s))),
    totalDiscounts: roundCurrency(
      monthlySales.filter((s) => !isCancelled(s)).reduce((sum, sale) => sum + toNumber(sale.discount), 0)
    )
  };
}

async function getDashboardSummary(query = {}) {
  const range = resolveDashboardDateRange(query);
  const allSales = await getAllSales();
  const settings = await settingsService.getSettings();
  const lowStockThreshold = settings.lowStockThreshold;

  const salesInPeriod = allSales.filter((sale) => {
    const t = new Date(sale.soldAt);
    return t >= range.start && t <= range.end;
  });

  const products = await getAllProducts();
  const productsCount = products.length;
  const lowStockCount = products.filter(
    (product) => product.stockQuantity > 0 && product.stockQuantity <= lowStockThreshold
  ).length;
  const soldOutCount = products.filter((product) => product.stockQuantity <= 0 || product.status === "ESGOTADO").length;

  const periodRevenue = sumSales(salesInPeriod);
  const periodEstimatedProfit = profitForSales(salesInPeriod);
  const periodSalesCount = salesInPeriod.filter((s) => !isCancelled(s)).length;
  const periodDiscounts = roundCurrency(
    salesInPeriod.filter((s) => !isCancelled(s)).reduce((sum, sale) => sum + toNumber(sale.discount), 0)
  );

  const recentSales = [...salesInPeriod]
    .sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt))
    .slice(0, 20)
    .map((sale) => ({
      id: sale.id,
      soldAt: sale.soldAt,
      status: saleStatus(sale),
      totalAmount: saleEffectiveTotalAmount(sale),
      itemsCount: sale.items?.length || 0,
      customerName: sale.customer?.name || null
    }));

  return {
    productsCount,
    lowStockCount,
    soldOutCount,
    lowStockThreshold,
    storeName: settings.storeName,
    filter: {
      startDate: range.startDate,
      endDate: range.endDate
    },
    periodSalesCount,
    periodRevenue,
    periodEstimatedProfit,
    periodDiscounts,
    recentSales,
    dailySalesChart: buildDailyChartSeries(allSales, 30),
    monthlySalesChart: buildMonthlyChartSeries(allSales, 12)
  };
}

function sumSales(sales) {
  return roundCurrency(sales.reduce((sum, sale) => sum + saleEffectiveTotalAmount(sale), 0));
}

/** Pecas liquidas vendidas na venda (devolucoes abatem por item). */
function netPiecesSold(sale) {
  if (isCancelled(sale)) return 0;
  const retMap = returnedQtyByProduct(sale);
  let n = 0;
  for (const item of sale.items || []) {
    if (!item) continue;
    const ret = retMap[item.productId] || 0;
    const net = Number(item.quantity) - ret;
    if (net > 0) n += net;
  }
  return n;
}

/** Ultimos N dias (inclui hoje): faturamento e quantidade de pecas por dia, fuso local do servidor. */
function buildDailyChartSeries(allSales, days = 30) {
  const today = new Date();
  const end = endOfDay(today);
  const startDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1), 0, 0, 0, 0);

  const keys = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + i, 0, 0, 0, 0);
    keys.push(formatDateOnly(d));
  }

  const map = {};
  for (const k of keys) map[k] = { revenue: 0, pieces: 0 };

  for (const sale of allSales) {
    if (isCancelled(sale)) continue;
    const sold = new Date(sale.soldAt);
    if (sold < startDay || sold > end) continue;
    const key = formatDateOnly(sold);
    if (map[key] == null) continue;
    map[key].revenue = roundCurrency(map[key].revenue + saleEffectiveTotalAmount(sale));
    map[key].pieces += netPiecesSold(sale);
  }

  return keys.map((date) => {
    const [, m, day] = date.split("-");
    return {
      date,
      shortLabel: `${day}/${m}`,
      revenue: map[date].revenue,
      pieces: map[date].pieces
    };
  });
}

function formatMonthAxisLabel(ym) {
  const [yStr, mStr] = ym.split("-");
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  const shortMonth = d
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(/\./g, "")
    .trim();
  const cap = shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1);
  return `${cap}/${String(y).slice(-2)}`;
}

/** Ultimos M meses (inclui mes atual): faturamento e pecas por mes. */
function buildMonthlyChartSeries(allSales, monthsBack = 12) {
  const end = new Date();
  const keys = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const map = {};
  for (const k of keys) map[k] = { revenue: 0, pieces: 0 };

  for (const sale of allSales) {
    if (isCancelled(sale)) continue;
    const sold = new Date(sale.soldAt);
    const ym = `${sold.getFullYear()}-${String(sold.getMonth() + 1).padStart(2, "0")}`;
    if (map[ym] == null) continue;
    map[ym].revenue = roundCurrency(map[ym].revenue + saleEffectiveTotalAmount(sale));
    map[ym].pieces += netPiecesSold(sale);
  }

  return keys.map((month) => ({
    month,
    shortLabel: formatMonthAxisLabel(month),
    revenue: map[month].revenue,
    pieces: map[month].pieces
  }));
}

function getPaymentMethods(sales) {
  const result = {};

  for (const sale of sales) {
    if (isCancelled(sale)) continue;
    if (!sale.payment) continue;
    result[sale.payment.method] = (result[sale.payment.method] || 0) + 1;
  }

  return Object.entries(result).map(([method, count]) => ({ method, count }));
}

function getTopProducts(sales) {
  const result = {};

  for (const sale of sales) {
    if (isCancelled(sale)) continue;
    const retMap = returnedQtyByProduct(sale);
    for (const item of sale.items || []) {
      const net = item.quantity - (retMap[item.productId] || 0);
      if (net <= 0) continue;
      const name = item.product?.name || "Produto removido";
      result[name] = (result[name] || 0) + net;
    }
  }

  return Object.entries(result)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

async function getAllSales() {
  const snapshot = await salesRef.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getAllProducts() {
  const snapshot = await productsRef.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  getDashboardSummary,
  getFinanceSummary
};
