TRUNCATE TABLE posts, authors RESTART IDENTITY;

INSERT INTO authors (name, email, bio) VALUES
  ('Ana García', 'ana@example.com', 'Desarrolladora full-stack apasionada por Node.js'),
  ('Carlos Ruiz', 'carlos@example.com', 'Escritor técnico especializado en bases de datos'),
  ('María López', 'maria@example.com', 'Ingeniera de software con foco en APIs REST');

INSERT INTO posts (author_id, title, content, published) VALUES
  (1, 'Introducción a Node.js', 'Node.js es un runtime de JavaScript...', TRUE),
  (2, 'PostgreSQL vs MySQL', 'Ambas bases de datos tienen ventajas...', TRUE),
  (1, 'APIs RESTful', 'REST es un estilo arquitectónico...', TRUE),
  (3, 'Manejo de errores en Express', 'El manejo apropiado de errores...', FALSE),
  (3, 'Async/Await explicado', 'Las promesas simplifican el código asíncrono...', FALSE);
