const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const db = require('./db');
const fs = require('fs');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: false}));

//READ: menampilkan semua user
app.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.render('index', {users: results});
    });
});

//set up storage engine untuk multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage});

//CREATE menambahkan form 
app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', upload.single('file'), (req, res) => {
    const {name, email,} = req.body;
    const {filename, path: filepath} = req.file;
    db.query('INSERT INTO users SET ?', { name, email, filename, filepath}, (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

//UPDATE edit form
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        res.render('edit', {user: results[0]});
    });
});

app.post('/edit/:id', upload.single('file'), (req, res) => {
    const {name, email} = req.body;
    const id = req.params.id;
    const newFile = req.file;

    db.query('SELECT filepath FROM users WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        const oldfilePath = results[0]?.filepath;

        if (!newFile) {
            db.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id], (updateErr) => {
                if (updateErr) throw updateErr;
                res.redirect('/');
            });
            return;
        }

        const {filename, path: filepath} = newFile;
        const doUpdate = () => {
            db.query(
                'UPDATE users SET name = ?, email = ?, filename = ?, filepath = ? WHERE id = ?',
                [name, email, filename, filepath, id],
                (updateErr) => {
                    if (updateErr) throw updateErr;
                    res.redirect('/');
                }
            );
        };

        if (!oldfilePath) {
            doUpdate();
            return;
        }

        fs.unlink(oldfilePath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') throw unlinkErr;
            doUpdate();
        });
    });
});

//DELETE 
app.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT filepath FROM users WHERE id = ?', [id], (err, results) => {
        if (err) throw err;
        const imagePath = results[0]?.filepath;

        const deleteUser = () => {
            db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
                if (err) throw err;
                res.redirect('/');
            });
        };

        if (!imagePath) {
            deleteUser();
            return;
        }

        //hapus gambar dari server
        fs.unlink(imagePath, (unlinkErr) => {
            if (unlinkErr && unlinkErr.code !== 'ENOENT') throw unlinkErr;
            deleteUser();
        });
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
}); 