const router = require("express").Router();

router.get("/", (req, res) => {
  res.redirect("/mahasiswa");
});

module.exports = router;