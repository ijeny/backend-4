const Mahasiswa = require("../models/Mahasiswa");

module.exports = {
  viewMahasiswa: async (req, res) => {
    try {
      const mahasiswa = await Mahasiswa.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };

      res.render("index", {
        mahasiswa,
        alert,
        title: "CRUD",
      });
    } catch (error) {
      res.redirect("/mahasiswa");
    }
  },

  addMahasiswa: async (req, res) => {
    try {
      const { nama, nim, jurusan, alamat } = req.body;

      await Mahasiswa.create({ nama, nim, jurusan, alamat });

      req.flash("alertMessage", "Success add data mahasiswa");
      req.flash("alertStatus", "success");
      res.redirect("/mahasiswa");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/mahasiswa");
    }
  },

  editMahasiswa: async (req, res) => {
    try {
      const { id, nama, nim, jurusan, alamat } = req.body;
      const mahasiswa = await Mahasiswa.findOne({ _id: id });

      mahasiswa.nama = nama;
      mahasiswa.nim = nim;
      mahasiswa.jurusan = jurusan;
      mahasiswa.alamat = alamat;

      await mahasiswa.save();

      req.flash("alertMessage", "Success edit data mahasiswa");
      req.flash("alertStatus", "success");
      res.redirect("/mahasiswa");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/mahasiswa");
    }
  },

  deleteMahasiswa: async (req, res) => {
    try {
      const { id } = req.params;
      const mahasiswa = await Mahasiswa.findOne({ _id: id });

      await mahasiswa.deleteOne();

      req.flash("alertMessage", "Success delete data mahasiswa");
      req.flash("alertStatus", "warning");
      res.redirect("/mahasiswa");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/mahasiswa");
    }
  },
};
