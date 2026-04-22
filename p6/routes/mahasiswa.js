const router = require("express").Router();
const mahasiswaController = require("../controllers/mahasiswaController");

router.get("/", mahasiswaController.viewMahasiswa);
router.get("/add", mahasiswaController.viewAddMahasiswa);
router.post("/add", mahasiswaController.addMahasiswa);
router.get("/edit/:id", mahasiswaController.viewEditMahasiswa);
router.post("/edit/:id", mahasiswaController.editMahasiswa);
router.get("/delete/:id", mahasiswaController.deleteMahasiswa);

module.exports = router;