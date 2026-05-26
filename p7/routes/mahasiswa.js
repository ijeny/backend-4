const router = require("express").Router();
const mahasiswaController = require("../controllers/mahasiswaController");

router.get("/", mahasiswaController.viewMahasiswa);
router.post("/", mahasiswaController.addMahasiswa);
router.put("/", mahasiswaController.editMahasiswa);
router.delete("/:id", mahasiswaController.deleteMahasiswa);

module.exports = router;
