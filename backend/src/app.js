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

/** Origem na lista aponta para localhost (qualquer porta do Vite). */
function looksLikeLocalDevEntry(entry) {
  return (
    /^https?:\/\/localhost(?::\d+)?$/i.test(entry) ||
    /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i.test(entry) ||
    /^https?:\/\/\[::1\](?::\d+)?$/i.test(entry)
  );
}

/** Navegador envia origem com porta (ex.: Vite em 5174 enquanto .env citava 5173). */
function isLocalDevBrowserOrigin(origin) {
  return (
    /^https?:\/\/localhost:\d+$/i.test(origin) ||
    /^https?:\/\/127\.0\.0\.1:\d+$/i.test(origin) ||
    /^https?:\/\/\[::1\]:\d+$/i.test(origin)
  );
}

/** Uma origem ou varias separadas por virgula (ex.: localhost + IP na rede para o mesmo front). */
function resolveCorsOrigin() {
  const raw = process.env.FRONTEND_URL;
  if (!raw || raw === "*") return true;
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return true;

  if (list.some(looksLikeLocalDevEntry)) {
    return (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isLocalDevBrowserOrigin(origin)) return callback(null, true);
      if (list.includes(origin)) return callback(null, true);
      return callback(null, false);
    };
  }

  if (list.length === 1) return list[0];
  return list;
}

app.use(cors({ origin: resolveCorsOrigin() }));
app.use(express.json());
app.use(morgan("dev"));

/** Health na raiz: alguns paineis (Render) configuram path /health sem /api. */
app.get("/health", (req, res) => {
  res.json({ status: "ok", app: "Maricota Kids API" });
});

app.get("/", (req, res) => {
  res.json({
    app: "Maricota Kids API",
    health: "/api/health",
    healthAlt: "/health",
    login: "POST /api/auth/login"
  });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({
    message: "Not Found",
    hint: "Rotas da API usam o prefixo /api (ex.: GET /api/health)."
  });
});

app.use(errorMiddleware);

module.exports = app;
