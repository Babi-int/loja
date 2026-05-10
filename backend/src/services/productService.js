/**
 * Produtos: cadastro, preço de venda derivado e estoque no Firestore.
 * Busca textual é feita em memória após orderBy (simples para o volume típico da loja).
 */
const { db } = require("../database/firebase");
const { calculateSalePrice } = require("../utils/money");

const productsRef = db.collection("products");

function resolveStatus(stockQuantity, status) {
  // Estoque zero força ESGOTADO independente do status manual.
  if (Number(stockQuantity) <= 0) {
    return "ESGOTADO";
  }

  return status || "ATIVO";
}

function normalizeBarcode(barcode) {
  return String(barcode || "").trim();
}

async function listProducts({ search, category, status }) {
  const snapshot = await productsRef.orderBy("createdAt", "desc").get();
  const normalizedSearch = search?.toLowerCase();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        `${product.name} ${product.clothingType} ${product.brand || ""} ${product.barcode || ""}`
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesSearch && (!category || product.category === category) && (!status || product.status === status);
    });
}

async function createProduct(data) {
  const salePrice = calculateSalePrice(data.purchasePrice, data.profitPercentage);
  const now = new Date().toISOString();
  const product = {
    name: data.name,
    clothingType: data.clothingType,
    category: data.category,
    size: data.size,
    brand: data.brand || "",
    barcode: normalizeBarcode(data.barcode),
    stockQuantity: Number(data.stockQuantity),
    purchasePrice: Number(data.purchasePrice),
    profitPercentage: Number(data.profitPercentage),
    salePrice,
    status: resolveStatus(data.stockQuantity, data.status),
    createdAt: now,
    updatedAt: now
  };

  const doc = await productsRef.add(product);
  return { id: doc.id, ...product };
}

async function updateProduct(id, data) {
  const salePrice = calculateSalePrice(data.purchasePrice, data.profitPercentage);
  const product = {
    name: data.name,
    clothingType: data.clothingType,
    category: data.category,
    size: data.size,
    brand: data.brand || "",
    barcode: normalizeBarcode(data.barcode),
    stockQuantity: Number(data.stockQuantity),
    purchasePrice: Number(data.purchasePrice),
    profitPercentage: Number(data.profitPercentage),
    salePrice,
    status: resolveStatus(data.stockQuantity, data.status),
    updatedAt: new Date().toISOString()
  };

  await productsRef.doc(id).update(product);
  const updated = await productsRef.doc(id).get();
  return { id: updated.id, ...updated.data() };
}

async function deleteProduct(id) {
  await productsRef.doc(id).delete();
}

module.exports = {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct
};
