/** Montagem das rotas REST; prefixo /api aplicado em app.js. */
const { Router } = require("express");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const saleRoutes = require("./saleRoutes");
const financeRoutes = require("./financeRoutes");
const customerRoutes = require("./customerRoutes");
const settingsRoutes = require("./settingsRoutes");
const userRoutes = require("./userRoutes");

const routes = Router();

routes.get("/health", (req, res) => res.json({ status: "ok", app: "Maricota Kids API" }));
routes.use("/auth", authRoutes);
routes.use("/products", productRoutes);
routes.use("/customers", customerRoutes);
routes.use("/sales", saleRoutes);
routes.use("/finance", financeRoutes);
routes.use("/settings", settingsRoutes);
routes.use("/users", userRoutes);

module.exports = routes;
