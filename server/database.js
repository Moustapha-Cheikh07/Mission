const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const DB_DIR = path.join(__dirname, 'database');
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR);
}

const DB_PATH = path.join(DB_DIR, 'dashboard.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err);
    } else {
        console.log('📊 Database connected:', DB_PATH);
        initDatabase();
    }
});

// Initialize database schema
function initDatabase() {
    db.serialize(() => {
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');

        // Table for quality documents
        db.run(`
            CREATE TABLE IF NOT EXISTS quality_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                machine TEXT NOT NULL,
                description TEXT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                uploaded_by TEXT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Table for training documents
        db.run(`
            CREATE TABLE IF NOT EXISTS training_documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                filename TEXT NOT NULL,
                filepath TEXT NOT NULL,
                uploaded_by TEXT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Table for fiche etoile (forms)
        db.run(`
            CREATE TABLE IF NOT EXISTS fiche_etoile (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference TEXT NOT NULL,
                emetteur TEXT NOT NULL,
                date_fabrication TEXT NOT NULL,
                date TEXT NOT NULL,
                quantite INTEGER NOT NULL,
                avis_qualite TEXT,
                description TEXT NOT NULL,
                actions TEXT NOT NULL,
                delai TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Error creating tables:', err);
            } else {
                console.log('✅ Database tables initialized');
            }
        });
    });
}

// Helper function to promisify database operations
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Export database instance and helper functions
module.exports = {
    db,

    // Quality Documents
    addQualityDocument: async (doc) => {
        return runAsync(`
            INSERT INTO quality_documents (title, category, machine, description, filename, filepath, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [doc.title, doc.category, doc.machine, doc.description, doc.filename, doc.filepath, doc.uploaded_by]);
    },

    getQualityDocuments: async () => {
        return allAsync('SELECT * FROM quality_documents ORDER BY uploaded_at DESC');
    },

    getQualityDocumentsByMachine: async (machine) => {
        return allAsync('SELECT * FROM quality_documents WHERE machine = ? ORDER BY uploaded_at DESC', [machine]);
    },

    deleteQualityDocument: async (id) => {
        return runAsync('DELETE FROM quality_documents WHERE id = ?', [id]);
    },

    // Training Documents
    addTrainingDocument: async (doc) => {
        return runAsync(`
            INSERT INTO training_documents (title, category, description, filename, filepath, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [doc.title, doc.category, doc.description, doc.filename, doc.filepath, doc.uploaded_by]);
    },

    getTrainingDocuments: async () => {
        return allAsync('SELECT * FROM training_documents ORDER BY uploaded_at DESC');
    },

    deleteTrainingDocument: async (id) => {
        return runAsync('DELETE FROM training_documents WHERE id = ?', [id]);
    },

    // Fiche Etoile
    addFicheEtoile: async (fiche) => {
        return runAsync(`
            INSERT INTO fiche_etoile (reference, emetteur, date_fabrication, date, quantite, avis_qualite, description, actions, delai)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            fiche.reference,
            fiche.emetteur,
            fiche.date_fabrication,
            fiche.date,
            fiche.quantite,
            fiche.avis_qualite,
            fiche.description,
            fiche.actions,
            fiche.delai
        ]);
    },

    getFichesEtoile: async () => {
        return allAsync('SELECT * FROM fiche_etoile ORDER BY created_at DESC');
    },

    deleteFicheEtoile: async (id) => {
        return runAsync('DELETE FROM fiche_etoile WHERE id = ?', [id]);
    },

    // Close database connection
    close: () => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
};
