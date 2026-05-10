/** Último middleware da cadeia: expõe mensagem ao cliente e evita detalhes internos em produção. */
function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: error.message || "Erro interno do servidor."
  });
}

module.exports = errorMiddleware;
