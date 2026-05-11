/** Autenticação JWT: espera header Authorization: Bearer <token> emitido no login. */
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token nao informado." });
  }

  const parts = authHeader.split(" ");
  const token = parts.length >= 2 ? parts[1] : null;
  if (!token) {
    return res.status(401).json({ message: "Token nao informado." });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Servidor sem JWT_SECRET configurado." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalido ou expirado." });
  }
}

module.exports = authMiddleware;
