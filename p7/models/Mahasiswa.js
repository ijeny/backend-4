const mongoose = require("mongoose");

const mahasiswaSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
    },
    nim: {
      type: String,
      required: true,
    },
    jurusan: {
      type: String,
      default: "-",
    },
    alamat: {
      type: String,
      default: "-",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Mahasiswa", mahasiswaSchema);
