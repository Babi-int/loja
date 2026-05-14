/**
 * Registro de compras da loja junto aos fornecedores: historico + entrada de estoque.
 */
const { db } = require("../database/firebase");

const productsRef = db.collection("products");
const suppliersRef = db.collection("suppliers");
const purchasesRef = db.collection("supplier_purchases");

function resolveProductStockStatus(prevStatus, newStock) {
  if (newStock <= 0) return "ESGOTADO";
  if (prevStatus === "INATIVO") return "INATIVO";
  return "ATIVO";
}

function normalizePurchasedAt(value) {
  if (!value || String(value).trim() === "") {
    return new Date().toISOString();
  }
  const raw = String(value).trim();
  /** Aceita yyyy-mm-dd (input date) ou ISO completo */
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T12:00:00`).toISOString();
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

async function listPurchasesBySupplier(supplierId) {
  const snapshot = await purchasesRef.where("supplierId", "==", supplierId).get();
  const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  rows.sort((a, b) => {
    const ta = new Date(a.purchasedAt || a.createdAt || 0).getTime();
    const tb = new Date(b.purchasedAt || b.createdAt || 0).getTime();
    return tb - ta;
  });
  return rows;
}

async function recordPurchase(supplierId, body) {
  const productId = String(body.productId || "").trim();
  const qty = Math.floor(Number(body.quantity));
  const purchasedAt = normalizePurchasedAt(body.purchasedAt);

  if (!productId) {
    const error = new Error("Informe o produto comprado.");
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    const error = new Error("Informe uma quantidade valida maior que zero.");
    error.statusCode = 400;
    throw error;
  }

  const writtenAt = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const supRef = suppliersRef.doc(supplierId);
    const supSnap = await transaction.get(supRef);

    if (!supSnap.exists) {
      const error = new Error("Fornecedor nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const pRef = productsRef.doc(productId);
    const pSnap = await transaction.get(pRef);

    if (!pSnap.exists) {
      const error = new Error("Produto nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const product = { id: pSnap.id, ...pSnap.data() };
    const newStock = Number(product.stockQuantity) + qty;

    transaction.update(pRef, {
      stockQuantity: newStock,
      status: resolveProductStockStatus(product.status, newStock),
      updatedAt: writtenAt
    });

    const purchaseRef = purchasesRef.doc();
    const row = {
      id: purchaseRef.id,
      supplierId,
      productId,
      productName: product.name || "Produto",
      quantity: qty,
      purchasedAt,
      createdAt: writtenAt
    };

    transaction.set(purchaseRef, row);

    return row;
  });
}

module.exports = {
  listPurchasesBySupplier,
  recordPurchase
};
