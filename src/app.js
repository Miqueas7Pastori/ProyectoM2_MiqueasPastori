import express from "express";
import authorsRouter from "./routes/authors.js";
import postsRouter from "./routes/posts.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "MiniBlog",
    description: "API de usuarios y publicaciones de DevSpark",
    status: "ok",
  });
});

app.use("/authors", authorsRouter);
app.use("/posts", postsRouter);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
});

export default app;
