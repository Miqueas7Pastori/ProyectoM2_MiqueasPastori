import { Router } from "express";
import pool from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, author_id, title, content, published, created_at FROM posts ORDER BY id"
  );

  res.json(rows);
});

router.get("/author/:authorId", async (req, res) => {
  try {
    const authorResult = await pool.query(
      "SELECT id, name, email, bio, created_at FROM authors WHERE id = $1",
      [req.params.authorId]
    );
    const author = authorResult.rows[0];

    if (!author) {
      return res.status(404).json({ error: "Autor no encontrado" });
    }

    const postsResult = await pool.query(
      `SELECT id, title, content, published, created_at
       FROM posts
       WHERE author_id = $1
       ORDER BY id`,
      [req.params.authorId]
    );

    res.json(
      postsResult.rows.map((post) => ({
        ...post,
        author,
      }))
    );
  } catch (error) {
    if (error.code === "22P02") {
      return res.status(400).json({ error: "El id debe ser un número" });
    }

    throw error;
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, author_id, title, content, published, created_at FROM posts WHERE id = $1",
      [req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Publicación no encontrada" });
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
  const title = req.body.title?.trim();
  const content = req.body.content?.trim();
  const authorId = req.body.author_id;
  const published = req.body.published ?? false;

  if (!title) {
    return res.status(400).json({ error: "El título es obligatorio" });
  }

  if (!content) {
    return res.status(400).json({ error: "El contenido es obligatorio" });
  }

  if (authorId === undefined || authorId === null || authorId === "") {
    return res.status(400).json({ error: "El autor es obligatorio" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO posts (author_id, title, content, published)
       VALUES ($1, $2, $3, $4)
       RETURNING id, author_id, title, content, published, created_at`,
      [authorId, title, content, published]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "El autor no existe" });
    }

    if (error.code === "22P02") {
      return res.status(400).json({ error: "El author_id debe ser un número" });
    }

    throw error;
  }
});

router.put("/:id", async (req, res) => {
  const title = req.body.title?.trim();
  const content = req.body.content?.trim();
  const authorId = req.body.author_id;
  const published = req.body.published ?? false;

  if (!title) {
    return res.status(400).json({ error: "El título es obligatorio" });
  }

  if (!content) {
    return res.status(400).json({ error: "El contenido es obligatorio" });
  }

  if (authorId === undefined || authorId === null || authorId === "") {
    return res.status(400).json({ error: "El autor es obligatorio" });
  }

  if (!Number.isInteger(Number(authorId))) {
    return res.status(400).json({ error: "El author_id debe ser un número" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE posts
       SET author_id = $1, title = $2, content = $3, published = $4
       WHERE id = $5
       RETURNING id, author_id, title, content, published, created_at`,
      [authorId, title, content, published, req.params.id]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: "Publicación no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({ error: "El autor no existe" });
    }

    if (error.code === "22P02") {
      return res.status(400).json({ error: "El id debe ser un número" });
    }

    throw error;
  }
});

export default router;
