import { AppError } from "../errors/AppError.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Rota não encontrada." });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "O JSON enviado é inválido." });
  }

  if (error instanceof AppError) {
    return res.status(error.status).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {})
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Não foi possível concluir a operação." });
}
