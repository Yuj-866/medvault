// app.js - MedVault Backend

require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const app = express();
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());

// Use values from .env
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const port = process.env.PORT || 3000;

// Connect to DB
db.connect(err => {
    if (err) {
        console.error("❌ MySQL Connection Error:", err);
        return;
    }
    console.log("✅ Connected to MySQL");
    loadAndInsertMedicines(); // Only start loading after DB connection
});

// Function to load and insert medicines from JSON
function loadAndInsertMedicines() {
    const dataPath = path.join(__dirname, '../medvault-data/medicines.json');

    fs.readFile(dataPath, 'utf8', (err, jsonData) => {
        if (err) {
            console.error("❌ Error reading JSON file:", err);
            return;
        }

        let medicines;
        try {
            medicines = JSON.parse(jsonData);
        } catch (parseErr) {
            console.error("❌ Error parsing JSON data:", parseErr.message);
            return;
        }

        const validMedicines = medicines.filter(med => med["Medicine Name"] && med["Medicine Name"].trim() !== '');

        let inserted = 0;
        let completed = 0;

        validMedicines.forEach(med => {
            const {
                ["Medicine Name"]: name,
                Composition: composition,
                Uses: uses,
                Side_effects: side_effects,
                Manufacturer: manufacturer,
                ["Image URL"]: image_url,
                ["Excellent Review %"]: excellent = 0,
                ["Average Review %"]: average = 0,
                ["Poor Review %"]: poor = 0
            } = med;

            const query = `
                INSERT IGNORE INTO medicines 
                (name, composition, uses, side_effects, manufacturer, image_url,
                excellent_review_percent, average_review_percent, poor_review_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(query, [name, composition, uses, side_effects, manufacturer, image_url, excellent, average, poor], (err, result) => {
                completed++;
                if (!err && result.affectedRows > 0) {
                    inserted++;
                }

                if (completed === validMedicines.length) {
                    console.log(`✅ Total inserted (new) records: ${inserted}/${validMedicines.length}`);
                }
            });
        });
    });
}

// GET: List all medicines
app.get('/api/medicines', (req, res) => {
    db.query('SELECT * FROM medicines', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST: Add new medicine
app.post('/api/medicines', (req, res) => {
    const {
        name,
        composition,
        uses,
        side_effects,
        manufacturer,
        image_url,
        excellent_review_percent = 0,
        average_review_percent = 0,
        poor_review_percent = 0
    } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Medicine name is required.' });
    }

    const query = `
        INSERT IGNORE INTO medicines 
        (name, composition, uses, side_effects, manufacturer, image_url,
         excellent_review_percent, average_review_percent, poor_review_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [name, composition, uses, side_effects, manufacturer, image_url, excellent_review_percent, average_review_percent, poor_review_percent], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
            return res.status(409).json({ message: '⚠️ Medicine already exists. Ignored.' });
        }

        res.json({ message: '✅ Medicine added!', id: result.insertId });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
