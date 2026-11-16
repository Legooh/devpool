import { AppError } from "../errors/AppError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_PATTERN = /^[a-zA-Z0-9._-]+$/;
const ALLOWED_FIELDS = new Set(["name", "email", "login", "password", "active"]);

function ensureObject(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new AppError("Envie os dados do usuário em um objeto JSON.");
  }

  const unexpectedFields = Object.keys(payload).filter((field) => !ALLOWED_FIELDS.has(field));
  if (unexpectedFields.length) {
    throw new AppError("Existem campos que não são reconhecidos.", 400, unexpectedFields);
  }
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

export function validateUserPayload(payload, { partial = false } = {}) {
  ensureObject(payload);

  const data = {
    ...(Object.hasOwn(payload, "name") ? { name: normalizeString(payload.name) } : {}),
    ...(Object.hasOwn(payload, "email") ? { email: normalizeString(payload.email)?.toLowerCase() } : {}),
    ...(Object.hasOwn(payload, "login") ? { login: normalizeString(payload.login)?.toLowerCase() } : {}),
    ...(Object.hasOwn(payload, "password") ? { password: payload.password } : {}),
    ...(Object.hasOwn(payload, "active") ? { active: payload.active } : {})
  };

  if (!partial) {
    for (const field of ["name", "email", "login", "password"]) {
      if (!Object.hasOwn(data, field)) {
        throw new AppError(`O campo ${field} é obrigatório.`);
      }
    }
  } else if (Object.keys(data).length === 0) {
    throw new AppError("Informe ao menos um campo para atualizar.");
  }

  if (Object.hasOwn(data, "name") && (typeof data.name !== "string" || data.name.length < 3)) {
    throw new AppError("O nome deve possuir pelo menos 3 caracteres.");
  }

  if (Object.hasOwn(data, "email") && (
    typeof data.email !== "string" || !EMAIL_PATTERN.test(data.email)
  )) {
    throw new AppError("Informe um e-mail válido.");
  }

  if (Object.hasOwn(data, "login") && (
    typeof data.login !== "string" || data.login.length < 3 || !LOGIN_PATTERN.test(data.login)
  )) {
    throw new AppError("O login deve possuir pelo menos 3 caracteres e usar apenas letras, números, ponto, hífen ou sublinhado.");
  }

  if (Object.hasOwn(data, "password") && (
    typeof data.password !== "string" || data.password.length < 8
  )) {
    throw new AppError("A senha deve possuir pelo menos 8 caracteres.");
  }

  if (Object.hasOwn(data, "active") && typeof data.active !== "boolean") {
    throw new AppError("O campo active deve ser verdadeiro ou falso.");
  }

  return data;
}
