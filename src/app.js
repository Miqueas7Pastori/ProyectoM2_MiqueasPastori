const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "MiniBlog",
    description: "API de usuarios y publicaciones de DevSpark",
    status: "ok",
  });
});

module.exports = app;
