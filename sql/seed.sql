TRUNCATE TABLE posts, authors RESTART IDENTITY;

INSERT INTO authors (name, email, bio) VALUES
  ('Ada Lovelace', 'ada@miniblog.dev', 'Escribe sobre los inicios de la programación.'),
  ('Grace Hopper', 'grace@miniblog.dev', 'Comparte notas sobre compiladores y datos.');

INSERT INTO posts (author_id, title, content, published) VALUES
  (1, 'El primer programa', 'Notas sobre la máquina analítica.', TRUE),
  (1, 'Borrador sin publicar', 'Ideas que todavía no salen al blog.', FALSE),
  (2, 'Sobre los compiladores', 'Un compilador traduce un lenguaje a otro.', TRUE);
