const { Router } = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = Router();

routes.use(authMiddleware);
routes.get("/", productController.index);
routes.post("/", productController.store);
routes.post("/:id/stock-adjustment", productController.stockAdjustment);
routes.put("/:id", productController.update);
routes.delete("/:id", productController.destroy);

module.exports = routes;
