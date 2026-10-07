import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, bio, created_at FROM authors ORDER BY id"
  );

  res.json(rows);
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, bio, created_at FROM authors WHERE id = $1",
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    if (error.code === "22P02") {
      return res.status(400).json({ error: "El id debe ser un número" });
    }

    throw error;
  }
});

export default router;
