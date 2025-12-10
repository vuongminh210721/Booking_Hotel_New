import { Router } from "express";

const router = Router();

router.get("/demo", (_req, res) => {
  const response = { message: "Hello from backend API" };
  res.status(200).json(response);
});

export default router;
