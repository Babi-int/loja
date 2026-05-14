/** CRUD de fornecedores (razão social, documento, setor, observação). */
const { db } = require("../database/firebase");

const suppliersRef = db.collection("suppliers");

/** CNPJ/CPF: apenas dígitos; remove qualquer caractere especial. */
function normalizeTaxId(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePayload(body) {
  return {
    razaoSocial: String(body.razaoSocial || "").trim(),
    cnpjCpf: normalizeTaxId(body.cnpjCpf),
    setor: String(body.setor || "").trim(),
    observacao: String(body.observacao || "").trim()
  };
}

async function listSuppliers({ search }) {
  const snapshot = await suppliersRef.orderBy("createdAt", "desc").get();
  let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (search) {
    const q = search.toLowerCase();
    list = list.filter((s) =>
      `${s.razaoSocial} ${s.cnpjCpf || ""} ${s.setor || ""} ${s.observacao || ""}`
        .toLowerCase()
        .includes(q)
    );
  }

  return list;
}

async function createSupplier(body) {
  const data = normalizePayload(body);
  if (!data.razaoSocial) {
    const error = new Error("Razao social e obrigatoria.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const supplier = {
    ...data,
    createdAt: now,
    updatedAt: now
  };

  const doc = await suppliersRef.add(supplier);
  return { id: doc.id, ...supplier };
}

async function updateSupplier(id, body) {
  const data = normalizePayload(body);
  if (!data.razaoSocial) {
    const error = new Error("Razao social e obrigatoria.");
    error.statusCode = 400;
    throw error;
  }

  const update = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  await suppliersRef.doc(id).update(update);
  const snap = await suppliersRef.doc(id).get();
  return { id: snap.id, ...snap.data() };
}

async function deleteSupplier(id) {
  await suppliersRef.doc(id).delete();
}

module.exports = {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  updateSupplier
};
