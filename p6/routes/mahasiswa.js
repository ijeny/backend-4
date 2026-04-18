const router = require("express").Router();
const mahasiswaController = require("../controllers/mahasiswaController");

router.get("/", mahasiswaController.viewMahasiswa);

module.exports = router;