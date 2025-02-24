const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connexion MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'users_db'
});

db.connect(err => {
    if (err) {
        console.log('Erreur de connexion MySQL:', err);
    } else {
        console.log('Connecté à MySQL');
    }
});

// 🔹 Route d'inscription
app.post('/register', async (req, res) => {
    const { nom, prenom, email, password, date_naissance } = req.body;

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (nom, prenom, email, password, date_naissance) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nom, prenom, email, hashedPassword, date_naissance], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de l\'inscription', error: err.message });
        }
        res.status(201).json({ message: 'Inscription réussie' });
    });
});

// 🔹 Route de connexion
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mot de passe incorrect' });
        }

        // Génération du token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, 'secret_key', { expiresIn: '1h' });
        res.json({ message: 'Connexion réussie', token });
    });
});

// 🔹 Route pour récupérer le profil de l'utilisateur
app.get('/profile/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT id, nom, prenom, email, date_naissance FROM users WHERE id = ?';

    db.query(query, [userId], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }
        res.json(result[0]);
    });
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
