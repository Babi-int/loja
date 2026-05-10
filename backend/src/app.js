require("dotenv").config();

/**
 * Aplicação Express: CORS para o front, JSON, rotas sob /api e tratamento centralizado de erros.
 */
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);
app.use(errorMiddleware);

module.exports = app;
