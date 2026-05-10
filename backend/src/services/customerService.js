/** CRUD de clientes (responsável + dados da criança) para CRM futuro (ex.: aniversários). */
const { db } = require("../database/firebase");

const customersRef = db.collection("customers");

function normalizePayload(body) {
  return {
    name: String(body.name || "").trim(),
    phone: String(body.phone || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    childName: String(body.childName || "").trim(),
    childBirthDate: String(body.childBirthDate || "").trim()
  };
}

async function listCustomers({ search }) {
  const snapshot = await customersRef.orderBy("createdAt", "desc").get();
  let list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        `${c.name} ${c.phone} ${c.email} ${c.childName || ""}`.toLowerCase().includes(q)
    );
  }

  return list;
}

async function createCustomer(body) {
  const data = normalizePayload(body);
  if (!data.name) {
    const error = new Error("Nome da responsavel e obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const customer = {
    ...data,
    createdAt: now,
    updatedAt: now
  };

  const doc = await customersRef.add(customer);
  return { id: doc.id, ...customer };
}

async function updateCustomer(id, body) {
  const data = normalizePayload(body);
  if (!data.name) {
    const error = new Error("Nome da responsavel e obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  const update = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  await customersRef.doc(id).update(update);
  const snap = await customersRef.doc(id).get();
  return { id: snap.id, ...snap.data() };
}

async function deleteCustomer(id) {
  await customersRef.doc(id).delete();
}

async function getCustomerById(id) {
  const snap = await customersRef.doc(id).get();
  if (!snap.exists) {
    const error = new Error("Cliente nao encontrado.");
    error.statusCode = 404;
    throw error;
  }
  return { id: snap.id, ...snap.data() };
}

module.exports = {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer
};
