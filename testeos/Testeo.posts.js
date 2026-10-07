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
});
