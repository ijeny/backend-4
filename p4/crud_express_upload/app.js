const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");
const db = require("./db");
const fs = require("fs");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app.use(express.static('public'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.urlencoded({ extended: false }));

const PER_PAGE = 5;
const MAX_UPLOAD_SIZE = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i;

const getAlert = (req) => ({
  type: req.query.type || "",
  message: req.query.message || "",
});

const redirectWithAlert = (res, targetPath, message, type = "success") => {
  const params = new URLSearchParams({ type, message });
  res.redirect(`${targetPath}?${params.toString()}`);
};

const getUkuranList = (callback) => {
  db.query("SELECT id, nama_ukuran FROM ukuran ORDER BY nama_ukuran", callback);
};

// READ: menampilkan semua produk + search + filter + pagination
app.get("/", (req, res) => {
  const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
  const keyword = req.query.q ? String(req.query.q).trim() : "";
  const size = req.query.size ? Number(req.query.size) : 0;
  const offset = (page - 1) * PER_PAGE;

  const where = [];
  const params = [];

  if (keyword) {
    where.push("(tb.kode_baju LIKE ? OR tb.nama_baju LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (size) {
    where.push("tb.ukuran_id = ?");
    params.push(size);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  db.query(
    `SELECT tb.*, uk.nama_ukuran
         FROM toko_baju tb
         LEFT JOIN ukuran uk ON tb.ukuran_id = uk.id
         ${whereSql}
         ORDER BY tb.kode_baju DESC
         LIMIT ? OFFSET ?`,
    [...params, PER_PAGE, offset],
    (err, results) => {
      if (err) throw err;

      db.query(
        `SELECT COUNT(*) AS total
             FROM toko_baju tb
             ${whereSql}`,
        params,
        (countErr, countRows) => {
          if (countErr) throw countErr;

          getUkuranList((sizeErr, sizes) => {
            if (sizeErr) throw sizeErr;

            const totalData = countRows[0].total;
            const totalPages = Math.max(1, Math.ceil(totalData / PER_PAGE));

            res.render("index", {
              products: results,
              page,
              totalPages,
              keyword,
              size,
              sizes,
              alert: getAlert(req),
            });
          });
        },
      );
    },
  );
});

//set up storage engine untuk multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    const isValid = ALLOWED_EXTENSIONS.test(
      path.extname(file.originalname || ""),
    );
    if (!isValid) {
      cb(
        new Error(
          "Format gambar tidak valid. Gunakan jpg, jpeg, png, atau webp.",
        ),
      );
      return;
    }
    cb(null, true);
  },
});

// UKURAN: list + add
app.get("/ukuran", (req, res) => {
  getUkuranList((err, sizes) => {
    if (err) throw err;
    res.render("ukuran", { sizes, alert: getAlert(req) });
  });
});

app.post("/ukuran", (req, res) => {
  const namaUkuran = String(req.body.nama_ukuran || "")
    .trim()
    .toUpperCase();

  if (!namaUkuran) {
    return redirectWithAlert(
      res,
      "/ukuran",
      "Nama ukuran wajib diisi.",
      "danger",
    );
  }

  db.query(
    "INSERT INTO ukuran (nama_ukuran) VALUES (?)",
    [namaUkuran],
    (err) => {
      if (err) {
        return redirectWithAlert(
          res,
          "/ukuran",
          "Ukuran gagal ditambahkan. Cek apakah ukurannya duplikat.",
          "danger",
        );
      }
      redirectWithAlert(res, "/ukuran", "Ukuran berhasil ditambahkan.");
    },
  );
});

// UKURAN: edit
app.get("/ukuran/edit/:id", (req, res) => {
  const ukuranId = req.params.id;

  db.query("SELECT * FROM ukuran WHERE id = ?", [ukuranId], (err, rows) => {
    if (err) throw err;
    if (!rows.length) {
      return redirectWithAlert(
        res,
        "/ukuran",
        "Data ukuran tidak ditemukan.",
        "danger",
      );
    }

    res.render("edit_ukuran", { ukuran: rows[0], alert: getAlert(req) });
  });
});

app.post("/ukuran/edit/:id", (req, res) => {
  const ukuranId = req.params.id;
  const namaUkuran = String(req.body.nama_ukuran || "")
    .trim()
    .toUpperCase();

  if (!namaUkuran) {
    return redirectWithAlert(
      res,
      `/ukuran/edit/${ukuranId}`,
      "Nama ukuran wajib diisi.",
      "danger",
    );
  }

  db.query(
    "UPDATE ukuran SET nama_ukuran = ? WHERE id = ?",
    [namaUkuran, ukuranId],
    (err) => {
      if (err) {
        return redirectWithAlert(
          res,
          `/ukuran/edit/${ukuranId}`,
          "Ukuran gagal diupdate.",
          "danger",
        );
      }
      redirectWithAlert(res, "/ukuran", "Ukuran berhasil diupdate.");
    },
  );
});

// UKURAN: delete dengan cek keterkaitan produk
app.get("/ukuran/delete/:id", (req, res) => {
  const ukuranId = req.params.id;

  db.query(
    "SELECT COUNT(*) AS total FROM toko_baju WHERE ukuran_id = ?",
    [ukuranId],
    (err, rows) => {
      if (err) throw err;

      if (rows[0].total > 0) {
        return redirectWithAlert(
          res,
          "/ukuran",
          "Ukuran tidak bisa dihapus karena masih dipakai produk.",
          "danger",
        );
      }

      db.query("DELETE FROM ukuran WHERE id = ?", [ukuranId], (deleteErr) => {
        if (deleteErr) {
          return redirectWithAlert(
            res,
            "/ukuran",
            "Ukuran gagal dihapus.",
            "danger",
          );
        }
        redirectWithAlert(res, "/ukuran", "Ukuran berhasil dihapus.");
      });
    },
  );
});

// CREATE menambahkan form
app.get("/add", (req, res) => {
  getUkuranList((err, sizes) => {
    if (err) throw err;
    res.render("add", { sizes, alert: getAlert(req) });
  });
});

app.post("/add", upload.single("file"), (req, res) => {
  const {
    kode_baju,
    nama_baju,
    ukuran_id,
    warna,
    stok,
    harga_pokok,
    harga_jual,
  } = req.body;

  const hargaPokokNum = Number(harga_pokok);
  const hargaJualNum = Number(harga_jual);

  if (Number.isNaN(hargaPokokNum) || Number.isNaN(hargaJualNum)) {
    return redirectWithAlert(
      res,
      "/add",
      "Harga pokok dan harga jual harus berupa angka yang valid.",
      "danger",
    );
  }

  if (hargaJualNum < hargaPokokNum) {
    return redirectWithAlert(
      res,
      "/add",
      "Harga jual tidak boleh lebih kecil dari harga pokok.",
      "danger",
    );
  }

  const filename = req.file ? req.file.filename : null;
  const filepath = req.file ? req.file.path : null;

  const query = `
        INSERT INTO toko_baju
        (kode_baju, nama_baju, ukuran_id, warna, stok, harga_pokok, harga_jual, filename, filepath)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [
      kode_baju,
      nama_baju,
      ukuran_id,
      warna,
      stok,
      harga_pokok,
      harga_jual,
      filename,
      filepath,
    ],
    (err) => {
      if (err) {
        return redirectWithAlert(
          res,
          "/add",
          "Produk gagal ditambahkan. Periksa kode baju agar tidak duplikat.",
          "danger",
        );
      }
      redirectWithAlert(res, "/", "Produk berhasil ditambahkan.");
    },
  );
});

//UPDATE edit form
app.get("/edit/:kode_baju", (req, res) => {
  const kodeBaju = req.params.kode_baju;
  db.query(
    "SELECT * FROM toko_baju WHERE kode_baju = ?",
    [kodeBaju],
    (err, results) => {
      if (err) throw err;
      if (!results.length) {
        return redirectWithAlert(res, "/", "Produk tidak ditemukan.", "danger");
      }

      getUkuranList((sizeErr, sizes) => {
        if (sizeErr) throw sizeErr;
        res.render("edit", {
          product: results[0],
          sizes,
          alert: getAlert(req),
        });
      });
    },
  );
});

app.post("/edit/:kode_baju", upload.single("file"), (req, res) => {
  const { nama_baju, ukuran_id, warna, stok, harga_pokok, harga_jual } =
    req.body;
  const kodeBaju = req.params.kode_baju;
  const newFile = req.file;

  const hargaPokokNum = Number(harga_pokok);
  const hargaJualNum = Number(harga_jual);

  if (Number.isNaN(hargaPokokNum) || Number.isNaN(hargaJualNum)) {
    return redirectWithAlert(
      res,
      `/edit/${kodeBaju}`,
      "Harga pokok dan harga jual harus berupa angka yang valid.",
      "danger",
    );
  }

  if (hargaJualNum < hargaPokokNum) {
    return redirectWithAlert(
      res,
      `/edit/${kodeBaju}`,
      "Harga jual tidak boleh lebih kecil dari harga pokok.",
      "danger",
    );
  }

  db.query(
    "SELECT filepath FROM toko_baju WHERE kode_baju = ?",
    [kodeBaju],
    (err, results) => {
      if (err) throw err;
      const oldfilePath = results[0]?.filepath;

      if (!newFile) {
        db.query(
          `UPDATE toko_baju
                 SET nama_baju = ?, ukuran_id = ?, warna = ?, stok = ?, harga_pokok = ?, harga_jual = ?
                 WHERE kode_baju = ?`,
          [
            nama_baju,
            ukuran_id,
            warna,
            stok,
            harga_pokok,
            harga_jual,
            kodeBaju,
          ],
          (updateErr) => {
            if (updateErr) {
              return redirectWithAlert(
                res,
                `/edit/${kodeBaju}`,
                "Produk gagal diupdate.",
                "danger",
              );
            }
            redirectWithAlert(res, "/", "Produk berhasil diupdate.");
          },
        );
        return;
      }

      const filename = newFile.filename;
      const filepath = newFile.path;
      const doUpdate = () => {
        db.query(
          `UPDATE toko_baju
                 SET nama_baju = ?, ukuran_id = ?, warna = ?, stok = ?, harga_pokok = ?, harga_jual = ?, filename = ?, filepath = ?
                 WHERE kode_baju = ?`,
          [
            nama_baju,
            ukuran_id,
            warna,
            stok,
            harga_pokok,
            harga_jual,
            filename,
            filepath,
            kodeBaju,
          ],
          (updateErr) => {
            if (updateErr) {
              return redirectWithAlert(
                res,
                `/edit/${kodeBaju}`,
                "Produk gagal diupdate.",
                "danger",
              );
            }
            redirectWithAlert(res, "/", "Produk berhasil diupdate.");
          },
        );
      };

      if (!oldfilePath) {
        doUpdate();
        return;
      }

      fs.unlink(oldfilePath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== "ENOENT") throw unlinkErr;
        doUpdate();
      });
    },
  );
});

//DELETE
app.get("/delete/:kode_baju", (req, res) => {
  const kodeBaju = req.params.kode_baju;

  db.query(
    "SELECT filepath FROM toko_baju WHERE kode_baju = ?",
    [kodeBaju],
    (err, results) => {
      if (err) throw err;
      const imagePath = results[0]?.filepath;

      const deleteProduct = () => {
        db.query(
          "DELETE FROM toko_baju WHERE kode_baju = ?",
          [kodeBaju],
          (err) => {
            if (err) {
              return redirectWithAlert(
                res,
                "/",
                "Produk gagal dihapus.",
                "danger",
              );
            }
            redirectWithAlert(res, "/", "Produk berhasil dihapus.");
          },
        );
      };

      if (!imagePath) {
        deleteProduct();
        return;
      }

      //hapus gambar dari server
      fs.unlink(imagePath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== "ENOENT") throw unlinkErr;
        deleteProduct();
      });
    },
  );
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return redirectWithAlert(
        res,
        req.path.includes("/edit/") ? req.path : "/add",
        "Ukuran file maksimal 2MB.",
        "danger",
      );
    }
    return redirectWithAlert(
      res,
      req.path.includes("/edit/") ? req.path : "/add",
      err.message,
      "danger",
    );
  }

  if (err && err.message && err.message.includes("Format gambar tidak valid")) {
    return redirectWithAlert(
      res,
      req.path.includes("/edit/") ? req.path : "/add",
      err.message,
      "danger",
    );
  }

  next(err);
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
