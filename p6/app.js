const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const mahasiswaRouter = require("./routes/mahasiswa");

const app = express();

// koneksi mongodb
mongoose
  .connect("mongodb://127.0.0.1:27017/p6db")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/mahasiswa", mahasiswaRouter);

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});