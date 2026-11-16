import { promises as fs } from "node:fs";
import path from "node:path";

export class FileUserRepository {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeQueue = Promise.resolve();
  }

  async initialize() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.#writeUsers([]);
    }
  }

  async findAll() {
    const users = await this.#readUsers();
    return users.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  async findById(id) {
    const users = await this.#readUsers();
    return users.find((user) => user.id === id) || null;
  }

  async findByEmail(email, ignoredId = null) {
    const normalizedEmail = email.toLowerCase();
    const users = await this.#readUsers();
    return users.find((user) => (
      user.id !== ignoredId && user.email.toLowerCase() === normalizedEmail
    )) || null;
  }

  async findByLogin(login, ignoredId = null) {
    const normalizedLogin = login.toLowerCase();
    const users = await this.#readUsers();
    return users.find((user) => (
      user.id !== ignoredId && user.login.toLowerCase() === normalizedLogin
    )) || null;
  }

  async create(user) {
    return this.#queueWrite(async () => {
      const users = await this.#readUsers();
      users.push(user);
      await this.#writeUsers(users);
      return user;
    });
  }

  async update(id, changes) {
    return this.#queueWrite(async () => {
      const users = await this.#readUsers();
      const index = users.findIndex((user) => user.id === id);

      if (index === -1) {
        return null;
      }

      users[index] = { ...users[index], ...changes };
      await this.#writeUsers(users);
      return users[index];
    });
  }

  async delete(id) {
    return this.#queueWrite(async () => {
      const users = await this.#readUsers();
      const remainingUsers = users.filter((user) => user.id !== id);

      if (remainingUsers.length === users.length) {
        return false;
      }

      await this.#writeUsers(remainingUsers);
      return true;
    });
  }

  async #readUsers() {
    const content = await fs.readFile(this.filePath, "utf8");
    const data = JSON.parse(content || "[]");

    if (!Array.isArray(data)) {
      throw new Error("O arquivo de usuários possui um formato inválido.");
    }

    return data;
  }

  async #writeUsers(users) {
    const temporaryFile = `${this.filePath}.tmp`;
    await fs.writeFile(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
    await fs.rename(temporaryFile, this.filePath);
  }

  #queueWrite(operation) {
    const nextOperation = this.writeQueue.then(operation, operation);
    this.writeQueue = nextOperation.catch(() => undefined);
    return nextOperation;
  }
}
