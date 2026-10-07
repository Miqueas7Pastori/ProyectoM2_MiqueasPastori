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

describe("authors", () => {
  it("lista los autores", async () => {
    const { status, body } = await request("/authors");

    assert.equal(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some((author) => author.email === "ada@miniblog.dev"));
  });

  it("devuelve el detalle de un autor", async () => {
    const { status, body } = await request("/authors/1");

    assert.equal(status, 200);
    assert.equal(body.name, "Ada Lovelace");
    assert.equal(body.email, "ada@miniblog.dev");
  });

  it("responde 404 si el autor no existe", async () => {
    const { status, body } = await request("/authors/999999");

    assert.equal(status, 404);
    assert.equal(body.error, "Autor no encontrado");
  });

  it("responde 400 si falta el nombre al crear", async () => {
    const { status, body } = await request("/authors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "sin-nombre@miniblog.dev" }),
    });

    assert.equal(status, 400);
    assert.equal(body.error, "El nombre es obligatorio");
  });

  it("responde 400 si el email ya existe", async () => {
    const { status, body } = await request("/authors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Otra Ada",
        email: "ada@miniblog.dev",
      }),
    });

    assert.equal(status, 400);
    assert.equal(body.error, "El email ya está registrado");
  });

  it("crea un autor y permite borrarlo", async () => {
    const created = await request("/authors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Autor de prueba",
        email: `prueba-${Date.now()}@miniblog.dev`,
      }),
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.name, "Autor de prueba");

    const deleted = await request(`/authors/${created.body.id}`, {
      method: "DELETE",
    });

    assert.equal(deleted.status, 204);
    assert.equal(deleted.body, null);
  });

  it("responde 400 al borrar un autor que tiene publicaciones", async () => {
    const { status, body } = await request("/authors/1", { method: "DELETE" });

    assert.equal(status, 400);
    assert.equal(body.error, "No se puede borrar un autor que tiene publicaciones");

    const author = await request("/authors/1");
    assert.equal(author.status, 200);
    assert.equal(author.body.email, "ada@miniblog.dev");
  });
});
