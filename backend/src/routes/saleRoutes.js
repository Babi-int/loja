const { Router } = require("express");
const saleController = require("../controllers/saleController");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = Router();

routes.use(authMiddleware);
routes.get("/exists", saleController.exists);
routes.post("/:id/cancel", saleController.cancel);
routes.post("/:id/returns", saleController.partialReturn);
routes.get("/", saleController.index);
routes.post("/", saleController.store);

module.exports = routes;
