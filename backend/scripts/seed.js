require("dotenv").config();

const bcrypt = require("bcryptjs");
const { db } = require("../src/database/firebase");

async function main() {
  const email = "admin@maricotakids.com";
  const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();

  if (!snapshot.empty) {
    console.log("Usuario administrador ja existe.");
    return;
  }

  const password = await bcrypt.hash("admin123", 10);
  const now = new Date().toISOString();

  await db.collection("users").add({
    name: "Administrador",
    email,
    password,
    role: "ADMIN",
    createdAt: now,
    updatedAt: now
  });

  console.log("Seed concluido. Login: admin@maricotakids.com / admin123");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
