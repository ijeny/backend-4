const mongoose = require("mongoose");

const mahasiswaSchema = new mongoose.Schema({
  nama: String,
  nim: String,
  jurusan: String,
  alamat: String,
});

module.exports = mongoose.model("Mahasiswa", mahasiswaSchema);
