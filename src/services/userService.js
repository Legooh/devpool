import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { AppError } from "../errors/AppError.js";
import { validateUserPayload } from "../validators/userValidator.js";

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

export class UserService {
  constructor(repository, { saltRounds = 10 } = {}) {
    this.repository = repository;
    this.saltRounds = saltRounds;
  }

  async list() {
    const users = await this.repository.findAll();
    return users.map(toPublicUser);
  }

  async getById(id) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }
    return toPublicUser(user);
  }

  async create(payload) {
    const data = validateUserPayload(payload);
    await this.#ensureUniqueFields(data);

    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      name: data.name,
      email: data.email,
      login: data.login,
      passwordHash: await bcrypt.hash(data.password, this.saltRounds),
      active: data.active ?? true,
      createdAt: now,
      updatedAt: now
    };

    return toPublicUser(await this.repository.create(user));
  }

  async update(id, payload) {
    await this.getById(id);
    const data = validateUserPayload(payload, { partial: true });
    await this.#ensureUniqueFields(data, id);

    const changes = {
      ...data,
      ...(data.password ? { passwordHash: await bcrypt.hash(data.password, this.saltRounds) } : {}),
      updatedAt: new Date().toISOString()
    };

    delete changes.password;
    const updatedUser = await this.repository.update(id, changes);
    return toPublicUser(updatedUser);
  }

  async delete(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new AppError("Usuário não encontrado.", 404);
    }
  }

  async #ensureUniqueFields(data, ignoredId = null) {
    if (data.email && await this.repository.findByEmail(data.email, ignoredId)) {
      throw new AppError("Já existe um usuário cadastrado com este e-mail.");
    }

    if (data.login && await this.repository.findByLogin(data.login, ignoredId)) {
      throw new AppError("Já existe um usuário cadastrado com este login.");
    }
  }
}
