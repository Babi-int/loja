const { Router } = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

const routes = Router();

routes.use(authMiddleware, adminMiddleware);
routes.get("/", userController.index);
routes.post("/", userController.store);
routes.delete("/:id", userController.destroy);

module.exports = routes;
