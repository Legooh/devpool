import { Router } from "express";

export function createUserRouter(userService) {
  const router = Router();

  router.post("/", async (req, res) => {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  });

  router.get("/", async (req, res) => {
    const users = await userService.list();
    res.status(200).json(users);
  });

  router.get("/:id", async (req, res) => {
    const user = await userService.getById(req.params.id);
    res.status(200).json(user);
  });

  const updateUser = async (req, res) => {
    const user = await userService.update(req.params.id, req.body);
    res.status(200).json(user);
  };

  router.put("/:id", updateUser);
  router.patch("/:id", updateUser);

  router.delete("/:id", async (req, res) => {
    await userService.delete(req.params.id);
    res.status(204).send();
  });

  return router;
}
