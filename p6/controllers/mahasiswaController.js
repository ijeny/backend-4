const Mahasiswa = require("../models/Mahasiswa");

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
};
