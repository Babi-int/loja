const { Router } = require("express");
const settingsController = require("../controllers/settingsController");
const authMiddleware = require("../middlewares/authMiddleware");

const routes = Router();

routes.use(authMiddleware);
routes.get("/", settingsController.show);
routes.put("/", settingsController.update);

module.exports = routes;
