import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, test } from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";

let app;
let temporaryDirectory;
let dataFile;

beforeEach(async () => {
  temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "goticket-devpool-"));
  dataFile = path.join(temporaryDirectory, "users.json");
  app = await createApp({ dataFile, saltRounds: 8 });
});

afterEach(async () => {
  await rm(temporaryDirectory, { recursive: true, force: true });
});

const validUser = {
  name: "Ana Souza",
  email: "ana@empresa.com",
  login: "ana.souza",
  password: "senha-segura"
};

test("executa o fluxo completo de criação, consulta, edição e exclusão", async () => {
  const created = await request(app).post("/users").send(validUser).expect(201);

  assert.ok(created.body.id);
  assert.equal(created.body.active, true);
  assert.equal(created.body.password, undefined);
  assert.equal(created.body.passwordHash, undefined);

  const list = await request(app).get("/users").expect(200);
  assert.equal(list.body.length, 1);

  const details = await request(app).get(`/users/${created.body.id}`).expect(200);
  assert.equal(details.body.email, validUser.email);

  const updated = await request(app)
    .patch(`/users/${created.body.id}`)
    .send({ name: "Ana Souza Lima", active: false })
    .expect(200);

  assert.equal(updated.body.name, "Ana Souza Lima");
  assert.equal(updated.body.active, false);

  await request(app).delete(`/users/${created.body.id}`).expect(204);
  await request(app).get(`/users/${created.body.id}`).expect(404);
});

test("rejeita nome, e-mail, login e senha inválidos", async () => {
  const response = await request(app).post("/users").send({
    name: "A",
    email: "email-invalido",
    login: "x",
    password: "123"
  }).expect(400);

  assert.match(response.body.message, /nome/i);
});

test("não permite e-mail ou login duplicados", async () => {
  await request(app).post("/users").send(validUser).expect(201);

  const duplicatedEmail = await request(app).post("/users").send({
    ...validUser,
    login: "outro.login"
  }).expect(400);
  assert.match(duplicatedEmail.body.message, /e-mail/i);

  const duplicatedLogin = await request(app).post("/users").send({
    ...validUser,
    email: "outro@empresa.com"
  }).expect(400);
  assert.match(duplicatedLogin.body.message, /login/i);
});

test("armazena somente o hash e nunca devolve a senha pela API", async () => {
  const created = await request(app).post("/users").send(validUser).expect(201);
  const storedUsers = JSON.parse(await readFile(dataFile, "utf8"));

  assert.notEqual(storedUsers[0].passwordHash, validUser.password);
  assert.match(storedUsers[0].passwordHash, /^\$2[aby]\$/);
  assert.equal(created.body.passwordHash, undefined);
});

test("protege a senha também quando ela é alterada", async () => {
  const created = await request(app).post("/users").send(validUser).expect(201);

  const updated = await request(app)
    .patch(`/users/${created.body.id}`)
    .send({ password: "nova-senha-segura" })
    .expect(200);

  const storedUsers = JSON.parse(await readFile(dataFile, "utf8"));
  assert.equal(updated.body.password, undefined);
  assert.equal(updated.body.passwordHash, undefined);
  assert.notEqual(storedUsers[0].passwordHash, "nova-senha-segura");
  assert.match(storedUsers[0].passwordHash, /^\$2[aby]\$/);
});

test("habilita CORS e responde JSON para rota de API inexistente", async () => {
  const corsResponse = await request(app)
    .get("/users")
    .set("Origin", "http://frontend.exemplo")
    .expect(200);

  assert.equal(corsResponse.headers["access-control-allow-origin"], "*");

  const missingRoute = await request(app).get("/api/rota-inexistente").expect(404);
  assert.equal(missingRoute.headers["content-type"].includes("application/json"), true);
  assert.equal(missingRoute.body.message, "Rota não encontrada.");
});
