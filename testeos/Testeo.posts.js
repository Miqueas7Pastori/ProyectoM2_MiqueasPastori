import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import app from "../src/app.js";
import pool from "../src/db.js";

let server;
let baseUrl;

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();

  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

before(async () => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

describe("posts", () => {
  it("lista las publicaciones", async () => {
    const { status, body } = await request("/posts");

    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some((post) => post.title === "El primer programa"));
  });

  it("devuelve el detalle de una publicación", async () => {
    const { status, body } = await request("/posts/1");

    assert.equal(status, 200);
    assert.equal(body.title, "El primer programa");
    assert.equal(body.author_id, 1);
  });

  it("responde 404 si la publicación no existe", async () => {
    const { status, body } = await request("/posts/999999");

    assert.equal(status, 404);
    assert.equal(body.error, "Publicación no encontrada");
  });

  it("responde 400 si el id no es un número", async () => {
    const { status, body } = await request("/posts/abc");

    assert.equal(status, 400);
    assert.equal(body.error, "El id debe ser un número");
  });

  it("lista las publicaciones de un autor", async () => {
    const { status, body } = await request("/posts/author/1");

    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some((post) => post.title === "El primer programa"));
    assert.equal(body[0].author.name, "Ada Lovelace");
    assert.equal(body[0].author.email, "ada@miniblog.dev");
  });

  it("responde 404 si el autor de las publicaciones no existe", async () => {
    const { status, body } = await request("/posts/author/999999");

    assert.equal(status, 404);
    assert.equal(body.error, "Autor no encontrado");
  });

  it("responde 400 si el id del autor no es un número", async () => {
    const { status, body } = await request("/posts/author/abc");

    assert.equal(status, 400);
    assert.equal(body.error, "El id debe ser un número");
  });

  it("responde 400 si falta el título al crear", async () => {
    const { status, body } = await request("/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: "Un texto", author_id: 1 }),
    });

    assert.equal(status, 400);
    assert.equal(body.error, "El título es obligatorio");
  });

  it("responde 400 si falta el contenido al crear", async () => {
    const { status, body } = await request("/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Un título", author_id: 1 }),
    });

    assert.equal(status, 400);
    assert.equal(body.error, "El contenido es obligatorio");
  });

  it("responde 400 si falta el autor al crear", async () => {
    const { status, body } = await request("/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Un título", content: "Un texto" }),
    });

    assert.equal(status, 400);
    assert.equal(body.error, "El autor es obligatorio");
  });

  it("responde 400 si el autor de la publicación no existe", async () => {
    const { status, body } = await request("/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Un título",
        content: "Un texto",
        author_id: 999999,
      }),
    });

    assert.equal(status, 400);
    assert.equal(body.error, "El autor no existe");
  });

  it("crea una publicación y la borra", async () => {
    const created = await request("/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Publicación de prueba",
        content: "Texto de prueba",
        author_id: 1,
      }),
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.title, "Publicación de prueba");
    assert.equal(created.body.author_id, 1);
    assert.equal(created.body.published, false);

    const deleted = await request(`/posts/${created.body.id}`, {
      method: "DELETE",
    });

    assert.equal(deleted.status, 204);
  });

  it("responde 400 si falta el título al actualizar", async () => {
    const { status, body } = await request("/posts/1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content: "Notas sobre la máquina analítica.",
        author_id: 1,
      }),
    });

    assert.equal(status, 400);
    assert.equal(body.error, "El título es obligatorio");
  });

  it("responde 404 si la publicación a actualizar no existe", async () => {
    const { status, body } = await request("/posts/999999", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Un título",
        content: "Un texto",
        author_id: 1,
      }),
    });

    assert.equal(status, 404);
    assert.equal(body.error, "Publicación no encontrada");
  });

  it("actualiza una publicación y restaura el original", async () => {
    const updated = await request("/posts/1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "Título actualizado",
        content: "Contenido actualizado",
        author_id: 1,
        published: true,
      }),
    });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.title, "Título actualizado");

    const restored = await request("/posts/1", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: "El primer programa",
        content: "Notas sobre la máquina analítica.",
        author_id: 1,
        published: true,
      }),
    });

    assert.equal(restored.status, 200);
    assert.equal(restored.body.title, "El primer programa");
  });
});
