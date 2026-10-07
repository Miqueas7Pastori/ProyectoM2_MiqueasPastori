import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, bio, created_at FROM authors ORDER BY id"
  );

  res.json(rows);
});

export default router;
