const mysql = require("mysql2");

const conn = mysql.createConnection({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "ijeny46",
  database: "db_crud",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Terhubung ke MySQL!");
});

module.exports = conn;
