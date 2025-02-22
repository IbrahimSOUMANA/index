const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware pour analyser les requêtes en JSON
app.use(express.json());

// Autoriser les requêtes cross-origin (CORS)
app.use(cors());

// Connexion à la base de données MySQL via EasyPHP
const db = mysql.createConnection({
    host: '127.0.0.1', // Adresse de ton serveur MySQL (EasyPHP utilise 127.0.0.1)
    user: 'root',      // Utilisateur par défaut de MySQL
    password: '',      // Mot de passe par défaut (vide sur EasyPHP)
    database: 'recensement'  // Le nom de la base de données que tu as créée
});

// Tester la connexion à la base de données
db.connect(err => {
    if (err) {
        console.log('Erreur de connexion à MySQL:', err);  // Si la connexion échoue, afficher l'erreur
    } else {
        console.log('Connecté à MySQL');  // Si la connexion réussit, afficher un message de succès
    }
});

// Route pour recevoir les données du formulaire et les insérer dans la base
app.post('/recensement', (req, res) => {
    const { nom, prenom, date_naissance, adresse, email, telephone } = req.body;

    const query = 'INSERT INTO personnes (nom, prenom, date_naissance, adresse, email, telephone) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [nom, prenom, date_naissance, adresse, email, telephone], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Erreur lors de l\'enregistrement', error: err.message });
        }
        res.status(200).json({ message: 'Données enregistrées avec succès', id: result.insertId });
    });
});

// Lancer le serveur sur le port 5000 (écouter sur toutes les interfaces réseau)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
