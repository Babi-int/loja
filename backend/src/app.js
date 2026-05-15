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

/** Extrai hostname se for IPv4 (valido como string). */
function parseIPv4Host(hostname) {
  const parts = hostname.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return parts.join(".");
}

/** LAN tipica para liberar troca de porta do Vite (mesmo IP nas entradas do .env). */
function isPrivateLanIPv4(hostname) {
  const ip = parseIPv4Host(hostname);
  if (!ip) return false;
  const [aStr, bStr] = hostname.split(".");
  const a = Number(aStr);
  const b = Number(bStr);
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/** Hosts IPv4 privados mencionados em FRONTEND_URL (qualquer porta do painel casa). */
function privateLanIpv4HostsFromWhitelist(list) {
  const hosts = new Set();
  for (const entry of list) {
    try {
      const h = new URL(entry).hostname;
      if (isPrivateLanIPv4(h)) hosts.add(h);
    } catch {
      /* entradas invalidas ignoradas */
    }
  }
  return hosts;
}

function originIpv4(hostname) {
  return parseIPv4Host(hostname || "");
}

function matchesPrivateLanWhitelist(origin, lanHosts) {
  if (lanHosts.size === 0) return false;
  try {
    const h = new URL(origin).hostname;
    return lanHosts.has(originIpv4(h) || "");
  } catch {
    return false;
  }
}

/** Uma origem ou varias separadas por virgula (ex.: localhost + IP na rede para o mesmo front). */
function resolveCorsOrigin() {
  const raw = process.env.FRONTEND_URL;
  if (!raw || raw === "*") return true;
  const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) return true;

  const privateLanIpv4Whitelist = privateLanIpv4HostsFromWhitelist(list);
  const useFlexibleDevCors =
    list.some(looksLikeLocalDevEntry) || privateLanIpv4Whitelist.size > 0;

  if (useFlexibleDevCors) {
    return (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isLocalDevBrowserOrigin(origin)) return callback(null, true);
      if (list.includes(origin)) return callback(null, true);
      if (matchesPrivateLanWhitelist(origin, privateLanIpv4Whitelist)) {
        return callback(null, true);
      }
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
