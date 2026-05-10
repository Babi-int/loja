const { db } = require("../database/firebase");

const productsRef = db.collection("products");
const movementsRef = db.collection("stock_movements");

function resolveProductStockStatus(prevStatus, newStock) {
  if (newStock <= 0) return "ESGOTADO";
  if (prevStatus === "INATIVO") return "INATIVO";
  return "ATIVO";
}

/**
 * Ajuste manual de estoque (inventário, perda, correção). delta > 0 entrada, < 0 saída.
 */
async function adjustStock(productId, { delta, reason }) {
  const d = Number(delta);
  const r = String(reason || "").trim();

  if (!r) {
    const error = new Error("Informe o motivo do ajuste de estoque.");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isFinite(d) || d === 0) {
    const error = new Error("Informe um delta numerico diferente de zero.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();

  return db.runTransaction(async (transaction) => {
    const ref = productsRef.doc(productId);
    const snap = await transaction.get(ref);

    if (!snap.exists) {
      const error = new Error("Produto nao encontrado.");
      error.statusCode = 404;
      throw error;
    }

    const p = snap.data();
    const newStock = Number(p.stockQuantity) + d;

    if (newStock < 0) {
      const error = new Error("O ajuste deixaria o estoque negativo.");
      error.statusCode = 400;
      throw error;
    }

    transaction.update(ref, {
      stockQuantity: newStock,
      status: resolveProductStockStatus(p.status, newStock),
      updatedAt: now
    });

    const moveRef = movementsRef.doc();
    transaction.set(moveRef, {
      id: moveRef.id,
      productId,
      delta: d,
      reason: r,
      type: "MANUAL",
      createdAt: now
    });

    return {
      id: snap.id,
      stockQuantity: newStock,
      status: resolveProductStockStatus(p.status, newStock),
      movementId: moveRef.id
    };
  });
}

module.exports = {
  adjustStock
};
