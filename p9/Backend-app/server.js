const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ecommerce",
});

// Test koneksi
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }

  console.log("Connected to MySQL");
});

// Route untuk mengambil data produk
app.get("/api/data", (req, res) => {
  db.query("SELECT * FROM produks", (err, results) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    } else {
      res.json(results);
    }
  });
});

app.get("/products", (req, res) => {
  db.query("SELECT * FROM produks", (err, results) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
