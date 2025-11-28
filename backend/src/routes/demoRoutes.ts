import { Router } from "express";
import { DemoResponse } from "@shared/api";

const router = Router();

router.get("/demo", (_req, res) => {
  const response: DemoResponse = { message: "Hello from backend API" };
  res.status(200).json(response);
});

export default router;
