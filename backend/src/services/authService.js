const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../database/firebase");

async function login({ email, password }) {
  const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();

  if (snapshot.empty) {
    const error = new Error("E-mail ou senha invalidos.");
    error.statusCode = 401;
    throw error;
  }

  const userDoc = snapshot.docs[0];
  const user = { id: userDoc.id, ...userDoc.data() };
  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    const error = new Error("E-mail ou senha invalidos.");
    error.statusCode = 401;
    throw error;
  }

  // Payload mínimo no token; não incluir senha nem dados sensíveis.
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = {
  login
};
