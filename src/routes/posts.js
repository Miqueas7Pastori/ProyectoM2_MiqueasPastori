import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, author_id, title, content, published, created_at FROM posts ORDER BY id"
  );

  res.json(rows);
});

export default router;
