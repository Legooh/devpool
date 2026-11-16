import path from "node:path";

export function loadConfig() {
  const port = Number(process.env.PORT || 3000);
  const saltRounds = Number(process.env.PASSWORD_SALT_ROUNDS || 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT deve ser um número inteiro positivo.");
  }

  if (!Number.isInteger(saltRounds) || saltRounds < 8 || saltRounds > 14) {
    throw new Error("PASSWORD_SALT_ROUNDS deve estar entre 8 e 14.");
  }

  return {
    port,
    saltRounds,
    dataFile: path.resolve(process.env.DATA_FILE || "./data/users.json")
  };
}
