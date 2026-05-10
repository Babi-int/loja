const bcrypt = require("bcryptjs");
const { db } = require("../database/firebase");

const usersRef = db.collection("users");

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

async function listUsers() {
  const snapshot = await usersRef.get();
  const list = snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name,
      email: d.email,
      role: d.role || "STAFF",
      createdAt: d.createdAt || ""
    };
  });
  return list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function createUser(body) {
  const name = String(body.name || "").trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const role = body.role === "ADMIN" ? "ADMIN" : "STAFF";

  if (!name) {
    const error = new Error("Nome e obrigatorio.");
    error.statusCode = 400;
    throw error;
  }

  if (!email || !email.includes("@")) {
    const error = new Error("E-mail invalido.");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Senha deve ter ao menos 6 caracteres.");
    error.statusCode = 400;
    throw error;
  }

  const dup = await usersRef.where("email", "==", email).limit(1).get();
  if (!dup.empty) {
    const error = new Error("Ja existe usuario com este e-mail.");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const hashed = await bcrypt.hash(password, 10);
  const user = {
    name,
    email,
    password: hashed,
    role,
    createdAt: now,
    updatedAt: now
  };

  const doc = await usersRef.add(user);
  return {
    id: doc.id,
    name,
    email,
    role,
    createdAt: now
  };
}

async function deleteUser(requestingUserId, targetId) {
  if (requestingUserId === targetId) {
    const error = new Error("Voce nao pode excluir seu proprio usuario.");
    error.statusCode = 400;
    throw error;
  }

  const doc = usersRef.doc(targetId);
  const snap = await doc.get();
  if (!snap.exists) {
    const error = new Error("Usuario nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  await doc.delete();
}

module.exports = {
  createUser,
  deleteUser,
  listUsers
};
