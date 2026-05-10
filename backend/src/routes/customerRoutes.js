const { Router } = require("express");
const customerController = require("../controllers/customerController");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = Router();

routes.use(authMiddleware);
routes.get("/", customerController.index);
routes.post("/", customerController.store);
routes.put("/:id", customerController.update);
routes.delete("/:id", customerController.destroy);

module.exports = routes;
