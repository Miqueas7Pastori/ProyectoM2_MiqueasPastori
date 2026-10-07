# MiniBlog

MiniBlog es la API de DevSpark para guardar autores y publicaciones. Está hecha con Node.js, Express y PostgreSQL.

Cada publicación pertenece a un solo autor. Un autor puede tener varias.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Código en GitHub | https://github.com/Miqueas7Pastori/ProyectoM2_MiqueasPastori |
| Contrato de la API | [openapi.json](openapi.json) |
| API publicada | Se completa cuando agreguemos Swagger |
| Página de Swagger | Se completa cuando agreguemos Swagger |

## Carpetas

```
openapi.json          contrato de las rutas, en JSON
package.json          dependencias y comandos
.env.example          variables de ejemplo, sin la contraseña real
sql/Tablas.sql        crea authors y posts
sql/seed.sql          carga los datos de ejemplo
src/app.js            define Express, las rutas y los errores
src/server.js         abre el puerto
src/db.js             se conecta a PostgreSQL
src/seed.js           corre el archivo sql/seed.sql
src/routes/           endpoints de autores y de publicaciones
testeos/              pruebas de authors y de posts
```

Un pedido entra por la ruta, la ruta le pregunta a PostgreSQL y la respuesta vuelve en JSON.

## Tablas

`authors` es el lado uno. `posts` es el lado muchos. La columna `posts.author_id` apunta a `authors.id`.

**authors**

- `id`: número que PostgreSQL asigna solo.
- `name`: obligatorio, hasta 100 caracteres.
- `email`: obligatorio y no se puede repetir.
- `bio`: texto libre. Puede ir vacío.
- `created_at`: fecha en la que se guardó el autor.

**posts**

- `id`: número que PostgreSQL asigna solo.
- `author_id`: obligatorio. Tiene que existir en `authors`.
- `title`: obligatorio, hasta 200 caracteres.
- `content`: obligatorio.
- `published`: obligatorio. Si no se envía, queda en falso.
- `created_at`: fecha en la que se guardó la publicación.

Si un autor todavía tiene publicaciones, la API no lo borra. Hay que borrar primero sus posts.

Los datos de ejemplo son Ana García, Carlos Ruiz, María López y cinco publicaciones. Están en `sql/seed.sql`.

## Correrla en la computadora

Hace falta Node.js 20 o superior, y PostgreSQL instalado y encendido.

Instalá las dependencias:

```bash
npm install
```

Copiá `.env.example` a un archivo nuevo llamado `.env` y poné la contraseña de tu PostgreSQL:

```text
PORT=3000
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/miniblog
```

`PORT` es el puerto de la API. `DATABASE_URL` es la dirección de la base. El archivo `.env` se queda en tu máquina. A GitHub solo sube `.env.example`.

Creá la base y las tablas:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE miniblog;"
psql -U postgres -h localhost -d miniblog -f sql/Tablas.sql
```

Si la terminal no encuentra `psql`, el programa está en `C:\Program Files\PostgreSQL\17\bin\psql.exe`.

Cargá los ejemplos:

```bash
npm run seed
```

Tiene que decir `Datos de prueba cargados`. Si lo volvés a correr, reemplaza los datos por los mismos de ejemplo.

Levantá la API:

```bash
npm run dev
```

Abrí http://localhost:3000. La respuesta tiene que incluir `"service": "MiniBlog"` y `"status": "ok"`.

`npm run dev` reinicia el servidor cuando guardás un archivo. `npm start` lo deja fijo, que es lo que usa Railway. Para apagarlo, `Ctrl+C` en esa terminal.

## Rutas

Si hay un error, el JSON trae un campo `error` con una frase corta.

Autores:

- `GET /authors` lista todos. Responde 200.
- `GET /authors/:id` trae uno. Responde 200, 400 si el id no es un número, o 404 si no existe.
- `POST /authors` crea uno. Hacen falta `name` y `email`. `bio` es opcional. Responde 201, o 400 si falta un dato o el email ya está usado.
- `PUT /authors/:id` reemplaza los datos. Responde 200, 400 o 404.
- `DELETE /authors/:id` lo borra. Responde 204. Responde 400 si tiene publicaciones o si el id no es un número, y 404 si no existe.

Publicaciones:

- `GET /posts` lista todas. Responde 200.
- `GET /posts/:id` trae una. Responde 200, 400 o 404.
- `GET /posts/author/:authorId` trae las de un autor, con el nombre y el email de esa persona. Responde 200, 400 o 404. Si el autor existe pero no publicó nada, la lista llega vacía.
- `POST /posts` crea una. Hacen falta `title`, `content` y `author_id`. `published` es opcional. Responde 201, o 400 si falta algo, si el autor no existe o si `author_id` no es un número.
- `PUT /posts/:id` la actualiza. Responde 200, 400 o 404.
- `DELETE /posts/:id` la borra. Responde 204, 400 o 404.

El 500 aparece solo cuando falla algo que la ruta no esperaba.

## Pruebas

```bash
npm test
```

Ese comando revisa 25 casos: 7 de autores y 18 de publicaciones. Cubre el listado, el detalle, el alta, la edición, el borrado y los errores 400 y 404.

Para que pasen, PostgreSQL tiene que estar prendido, el `.env` tiene que existir y el seed tiene que estar cargado. Los tests buscan a Ana García como autora número 1.

## OpenAPI

`openapi.json` describe cada ruta, los datos que recibe y los códigos que puede devolver. Con el servidor encendido se lee en:

http://localhost:3000/openapi.json

Hoy el navegador muestra ese JSON. La página visual de Swagger se suma en el próximo cambio.

## Publicar en Railway

1. Subí los commits con `git push`. No incluyas el `.env`.
2. En Railway, creá un proyecto desde el repositorio de GitHub.
3. En el mismo proyecto agregá una base PostgreSQL.
4. En el servicio de la API, en Variables, creá `DATABASE_URL` y enlazala con la `DATABASE_URL` de esa base. Usá la de Railway, no la contraseña de tu computadora.
5. Railway corre `npm start` y elige el puerto. El código lo toma de la variable `PORT`.
6. En PostgreSQL, abrí Query. Ejecutá primero `sql/Tablas.sql` y después `sql/seed.sql`.
7. En el servicio de la API, en Settings y Networking, generá el dominio público.

Hay dos direcciones y no sirven para lo mismo.

La URL interna es la `DATABASE_URL` que vive dentro de Railway y suele incluir `railway.internal`. La API la usa para hablar con PostgreSQL sin salir a internet. Esa es la que se enlaza en Variables.

La URL pública se abre desde afuera. La de la base sirve si querés conectarte desde tu computadora. La del servicio termina en `up.railway.app` y es la que usa quien quiera llamar a la API.
