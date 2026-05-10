const { Router } = require("express");
const financeController = require("../controllers/financeController");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = Router();

routes.use(authMiddleware);
routes.get("/summary", financeController.summary);
routes.get("/dashboard", financeController.dashboard);

module.exports = routes;
