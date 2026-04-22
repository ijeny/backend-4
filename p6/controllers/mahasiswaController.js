const Mahasiswa = require("../models/mahasiswa");

module.exports = {
  viewMahasiswa: async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.find();

      res.render("index", {
        mahasiswa,
        title: "CRUD",
      });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  },

  viewAddMahasiswa: (req, res) => {
    res.render("add", {
      title: "Tambah Mahasiswa",
    });
  },

  addMahasiswa: async (req, res) => {
    try {
      await Mahasiswa.create({
        nama: req.body.nama,
        nim: req.body.nim,
        jurusan: req.body.jurusan,
        alamat: req.body.alamat,
      });

      res.redirect("/mahasiswa");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  },

  viewEditMahasiswa: async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.findById(req.params.id);

      if (!mahasiswa) {
        return res.status(404).send("Data mahasiswa tidak ditemukan");
      }

      res.render("edit", {
        mahasiswa,
        title: "Edit Mahasiswa",
      });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  },

  editMahasiswa: async (req, res) => {
    try {
      await Mahasiswa.findByIdAndUpdate(req.params.id, {
        nama: req.body.nama,
        nim: req.body.nim,
        jurusan: req.body.jurusan,
        alamat: req.body.alamat,
      });

      res.redirect("/mahasiswa");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  },

  deleteMahasiswa: async (req, res) => {
    try {
      await Mahasiswa.findByIdAndDelete(req.params.id);
      res.redirect("/mahasiswa");
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  },
};
