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

router.post("/", async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const bio = req.body.bio ?? null;

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  if (!email) {
    return res.status(400).json({ error: "El email es obligatorio" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO authors (name, email, bio)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, bio, created_at`,
      [name, email, bio]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    throw error;
  }
});

router.put("/:id", async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim();
  const bio = req.body.bio ?? null;

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }

  if (!email) {
    return res.status(400).json({ error: "El email es obligatorio" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE authors
       SET name = $1, email = $2, bio = $3
       WHERE id = $4
       RETURNING id, name, email, bio, created_at`,
      [name, email, bio, req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    if (error.code === "22P02") {
      return res.status(400).json({ error: "El id debe ser un número" });
    }

    throw error;
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM authors WHERE id = $1", [
      req.params.id,
    ]);

    if (!rowCount) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    res.status(204).send();
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        error: "No se puede borrar un autor que tiene publicaciones",
      });
    }

    if (error.code === "22P02") {
      return res.status(400).json({ error: "El id debe ser un número" });
    }

    throw error;
  }
});

export default router;
