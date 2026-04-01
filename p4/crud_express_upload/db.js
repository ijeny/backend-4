const mysql = require("mysql2");

const conn = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "ijeny46",
  database: process.env.DB_NAME || "crud_user",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("terhubung ke MySQL!");
});

module.exports = conn;
