/**
 * Vendas: regras de negócio e persistência no Firestore.
 * Transação garante estoque consistente; cancelamento e devoluções parciais restauram estoque.
 */
const { db } = require("../database/firebase");
const { roundCurrency, toNumber } = require("../utils/money");
const customerService = require("./customerService");
const settingsService = require("./settingsService");

const productsRef = db.collection("products");
const salesRef = db.collection("sales");

function assertUnitSalePriceAllowed(product, unitSalePrice, settings) {
  const price = toNumber(unitSalePrice);
  const list = toNumber(product.salePrice);
  const cost = toNumber(product.purchasePrice);

  let minPrice = 0;
  if (settings.disallowSaleBelowCost !== false) {
    minPrice = Math.max(minPrice, cost);
  }
  const maxDisc = Number(settings.maxDiscountPercentFromList ?? 50);
  const listFloor = roundCurrency(list * (1 - maxDisc / 100));
  minPrice = Math.max(minPrice, listFloor);

  if (price + 1e-6 < minPrice) {
    const error = new Error(
      `Preco unitario de ${product.name} abaixo do permitido (minimo R$ ${minPrice.toFixed(2)} conforme custo e tabela).`
    );
    error.statusCode = 400;
    throw error;
  }
}

function getReturnedQtyByProduct(sale, productId) {
  let n = 0;
  for (const ret of sale.returns || []) {
    for (const l of ret.lines || []) {
      if (l.productId === productId) n += Number(l.quantity);
    }
  }
  return n;
}

function resolveProductStockStatus(prevStatus, newStock) {
  if (newStock <= 0) return "ESGOTADO";
  if (prevStatus === "INATIVO") return "INATIVO";
  return "ATIVO";
}

async function hasAnySale() {
  const snapshot = await salesRef.limit(1).get();
  return !snapshot.empty;
}

async function listSales(options = {}) {
  const customerId = options.customerId;

  if (customerId) {
    const snapshot = await salesRef.where("customerId", "==", customerId).get();
    const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    rows.sort((a, b) => {
      const ta = new Date(a.soldAt || a.createdAt || 0).getTime();
      const tb = new Date(b.soldAt || b.createdAt || 0).getTime();
      return tb - ta;
    });
    return rows;
  }

  const snapshot = await salesRef.orderBy("soldAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createSale(data) {
  if (!data.items?.length) {
    const error = new Error("Informe pelo menos um produto para a venda.");
    error.statusCode = 400;
    throw error;
  }

  const settings = await settingsService.getSettings();
  let customerPayload = null;
  let customerId = null;

  if (data.customerId) {
    const customer = await customerService.getCustomerById(data.customerId);
    customerId = customer.id;
    customerPayload = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || ""
    };
  }

  return db.runTransaction(async (transaction) => {
    const resolvedProducts = await Promise.all(data.items.map((item) => resolveProductForSale(transaction, item)));
    const productRefs = resolvedProducts.map(({ ref }) => ref);
    const productSnapshots = resolvedProducts.map(({ snapshot }) => snapshot);

    const items = data.items.map((item, index) => {
      const productSnapshot = productSnapshots[index];

      if (!productSnapshot.exists) {
        const error = new Error("Produto nao encontrado.");
        error.statusCode = 404;
        throw error;
      }

      const product = { id: productSnapshot.id, ...productSnapshot.data() };

      const unitSalePrice = toNumber(item.unitSalePrice || product.salePrice);
      assertUnitSalePriceAllowed(product, unitSalePrice, settings);

      const total = roundCurrency(unitSalePrice * Number(item.quantity));

      return {
        product,
        productId: product.id,
        quantity: Number(item.quantity),
        unitSalePrice,
        unitCostPrice: toNumber(product.purchasePrice),
        total
      };
    });

    const deltas = new Map();
    const refByProductId = new Map();

    items.forEach((item, index) => {
      const id = item.productId;
      deltas.set(id, (deltas.get(id) || 0) + item.quantity);
      if (!refByProductId.has(id)) refByProductId.set(id, productRefs[index]);
    });

    for (const [productId, totalOut] of deltas) {
      const sample = items.find((i) => i.productId === productId);
      if (totalOut > sample.product.stockQuantity) {
        const error = new Error(`Estoque insuficiente para ${sample.product.name}.`);
        error.statusCode = 400;
        throw error;
      }
    }

    const subtotal = roundCurrency(items.reduce((sum, item) => sum + item.total, 0));
    const discount = roundCurrency(data.discount || 0);
    const totalAmount = roundCurrency(subtotal - discount);

    if (totalAmount < 0) {
      const error = new Error("O desconto nao pode ser maior que o total da venda.");
      error.statusCode = 400;
      throw error;
    }

    const paidAmount = toNumber(data.paidAmount || totalAmount);
    const isCash = data.paymentMethod === "DINHEIRO";
    const changeAmount = isCash ? roundCurrency(paidAmount - totalAmount) : 0;

    if (isCash && changeAmount < 0) {
      const error = new Error("Valor pago em dinheiro menor que o total da venda.");
      error.statusCode = 400;
      throw error;
    }

    const installments = data.isInstallment ? Number(data.installments || 1) : 1;
    const installmentValue = roundCurrency(totalAmount / installments);

    const now = new Date().toISOString();
    const saleRef = salesRef.doc();
    const sale = {
      id: saleRef.id,
      status: "COMPLETED",
      customerId,
      customer: customerPayload,
      subtotal,
      discount,
      totalAmount,
      observation: data.observation || "",
      soldAt: now,
      createdAt: now,
      updatedAt: now,
      returns: [],
      items: items.map((item) => ({
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        unitSalePrice: item.unitSalePrice,
        unitCostPrice: item.unitCostPrice,
        total: item.total
      })),
      payment: {
        method: data.paymentMethod,
        isInstallment: Boolean(data.isInstallment),
        installments,
        installmentValue,
        paidAmount,
        changeAmount
      }
    };

    for (const [productId, totalOut] of deltas) {
      const sample = items.find((i) => i.productId === productId);
      const ref = refByProductId.get(productId);
      const newStock = sample.product.stockQuantity - totalOut;
      transaction.update(ref, {
        stockQuantity: newStock,
        status: resolveProductStockStatus(sample.product.status, newStock),
        updatedAt: now
      });
    }

    transaction.set(saleRef, sale);

    return sale;
  });
}

async function cancelSale(saleId) {
  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const saleRef = salesRef.doc(saleId);
    const saleSnap = await transaction.get(saleRef);

    if (!saleSnap.exists) {
      const error = new Error("Venda nao encontrada.");
      error.statusCode = 404;
      throw error;
    }

    const sale = { id: saleSnap.id, ...saleSnap.data() };
    if ((sale.status || "COMPLETED") !== "COMPLETED") {
      const error = new Error("Somente vendas concluidas podem ser canceladas.");
      error.statusCode = 400;
      throw error;
    }

    const deltas = new Map();
    for (const line of sale.items || []) {
      deltas.set(line.productId, (deltas.get(line.productId) || 0) + Number(line.quantity));
    }

    for (const ret of sale.returns || []) {
      for (const l of ret.lines || []) {
        const pid = l.productId;
        deltas.set(pid, (deltas.get(pid) || 0) - Number(l.quantity));
      }
    }

    for (const [productId, netRestore] of deltas) {
      if (netRestore < 0) {
        const error = new Error("Inconsistencia na venda: devolucoes registradas superam o vendido.");
        error.statusCode = 400;
        throw error;
      }
      if (netRestore === 0) continue;
      const ref = productsRef.doc(productId);
      const pSnap = await transaction.get(ref);
      if (!pSnap.exists) continue;
      const p = pSnap.data();
      const newStock = Number(p.stockQuantity) + netRestore;
      transaction.update(ref, {
        stockQuantity: newStock,
        status: resolveProductStockStatus(p.status, newStock),
        updatedAt: now
      });
    }

    transaction.update(saleRef, {
      status: "CANCELLED",
      cancelledAt: now,
      updatedAt: now
    });

    return { ...sale, status: "CANCELLED", cancelledAt: now, updatedAt: now };
  });
}

async function registerPartialReturn(saleId, body) {
  const reason = String(body.reason || "").trim();
  const rawItems = body.items;

  if (!reason) {
    const error = new Error("Informe o motivo da devolucao.");
    error.statusCode = 400;
    throw error;
  }

  if (!rawItems?.length) {
    const error = new Error("Informe ao menos um item para devolver.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const saleRef = salesRef.doc(saleId);
    const saleSnap = await transaction.get(saleRef);

    if (!saleSnap.exists) {
      const error = new Error("Venda nao encontrada.");
      error.statusCode = 404;
      throw error;
    }

    const sale = { id: saleSnap.id, ...saleSnap.data() };

    if ((sale.status || "COMPLETED") !== "COMPLETED") {
      const error = new Error("So e possivel registrar devolucao em vendas concluidas.");
      error.statusCode = 400;
      throw error;
    }

    const lines = [];
    const restoreMap = new Map();
    const pendingReturnByProduct = {};

    for (const ret of rawItems) {
      const productId = ret.productId;
      const qty = Math.floor(Number(ret.quantity));
      const soldLine = (sale.items || []).find((i) => i.productId === productId);

      if (!soldLine) {
        const error = new Error(`Produto nao faz parte desta venda.`);
        error.statusCode = 400;
        throw error;
      }

      if (!Number.isFinite(qty) || qty <= 0) {
        const error = new Error("Quantidade devolvida invalida.");
        error.statusCode = 400;
        throw error;
      }

      const already = getReturnedQtyByProduct(sale, productId) + (pendingReturnByProduct[productId] || 0);
      if (already + qty > soldLine.quantity) {
        const error = new Error(
          `Quantidade devolvida maior que o vendido para ${soldLine.product?.name || productId}.`
        );
        error.statusCode = 400;
        throw error;
      }

      pendingReturnByProduct[productId] = (pendingReturnByProduct[productId] || 0) + qty;

      lines.push({
        productId,
        quantity: qty,
        unitSalePrice: soldLine.unitSalePrice,
        unitCostPrice: soldLine.unitCostPrice
      });
      restoreMap.set(productId, (restoreMap.get(productId) || 0) + qty);
    }

    for (const [productId, qty] of restoreMap) {
      const ref = productsRef.doc(productId);
      const pSnap = await transaction.get(ref);
      if (!pSnap.exists) {
        const error = new Error("Produto nao encontrado para restaurar estoque.");
        error.statusCode = 404;
        throw error;
      }
      const p = pSnap.data();
      const newStock = Number(p.stockQuantity) + qty;
      transaction.update(ref, {
        stockQuantity: newStock,
        status: resolveProductStockStatus(p.status, newStock),
        updatedAt: now
      });
    }

    const returnEntry = { returnedAt: now, reason, lines };
    const returns = [...(sale.returns || []), returnEntry];

    transaction.update(saleRef, { returns, updatedAt: now });

    return {
      ...sale,
      returns,
      updatedAt: now
    };
  });
}

async function resolveProductForSale(transaction, item) {
  if (item.productId) {
    const ref = productsRef.doc(item.productId);
    const snapshot = await transaction.get(ref);
    return { ref, snapshot };
  }

  const barcode = String(item.barcode || "").trim();

  if (!barcode) {
    const error = new Error("Informe o produto ou o codigo de barras.");
    error.statusCode = 400;
    throw error;
  }

  const querySnapshot = await transaction.get(productsRef.where("barcode", "==", barcode).limit(1));

  if (querySnapshot.empty) {
    const error = new Error("Produto nao encontrado para o codigo de barras informado.");
    error.statusCode = 404;
    throw error;
  }

  const snapshot = querySnapshot.docs[0];
  return { ref: productsRef.doc(snapshot.id), snapshot };
}

module.exports = {
  cancelSale,
  createSale,
  hasAnySale,
  listSales,
  registerPartialReturn
};
