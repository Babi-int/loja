const { Router } = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = Router();

routes.post("/login", authController.login);
routes.get("/me", authMiddleware, authController.me);

module.exports = routes;
