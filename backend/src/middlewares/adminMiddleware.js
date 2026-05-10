/** Somente usuários com role ADMIN (JWT emitido no login). */
function adminMiddleware(req, res, next) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Acesso permitido apenas para administradores." });
  }
  return next();
}

module.exports = adminMiddleware;
