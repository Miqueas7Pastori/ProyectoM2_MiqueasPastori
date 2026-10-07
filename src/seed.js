import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "./db.js";

const directorio = path.dirname(fileURLToPath(import.meta.url));
const sql = await fs.readFile(path.join(directorio, "../sql/seed.sql"), "utf8");

try {
  await pool.query(sql);
  console.log("Datos de prueba cargados");
} finally {
  await pool.end();
}
