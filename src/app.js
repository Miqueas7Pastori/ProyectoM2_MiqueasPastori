import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import authorsRouter from "./routes/authors.js";
import postsRouter from "./routes/posts.js";

const openapiPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../openapi.json"
);
const openapi = JSON.parse(readFileSync(openapiPath, "utf8"));

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "MiniBlog",
    description: "API de usuarios y publicaciones de DevSpark",
    status: "ok",
  });
});

app.get("/openapi.json", (req, res) => {
  res.json(openapi);
});

app.use("/authors", authorsRouter);
app.use("/posts", postsRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;
