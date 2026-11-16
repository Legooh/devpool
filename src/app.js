import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { FileUserRepository } from "./repositories/fileUserRepository.js";
import { createUserRouter } from "./routes/userRoutes.js";
import { UserService } from "./services/userService.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(currentDirectory, "../public");

export async function createApp({ dataFile, saltRounds = 10 }) {
  const repository = new FileUserRepository(dataFile);
  await repository.initialize();

  const userService = new UserService(repository, { saltRounds });
  const app = express();

  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", application: "GoTicket DevPool Edition" });
  });

  app.use("/users", createUserRouter(userService));
  app.use("/api", notFoundHandler);
  app.use(express.static(publicDirectory));
  app.get("/{*path}", (req, res) => res.sendFile(path.join(publicDirectory, "index.html")));

  app.use(errorHandler);

  return app;
}
