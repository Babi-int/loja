const { Router } = require("express");
const supplierController = require("../controllers/supplierController");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = Router();

routes.use(authMiddleware);
routes.get("/", supplierController.index);
routes.post("/", supplierController.store);
routes.get("/:id/purchases", supplierController.purchaseIndex);
routes.post("/:id/purchases", supplierController.purchaseStore);
routes.put("/:id", supplierController.update);
routes.delete("/:id", supplierController.destroy);

module.exports = routes;
