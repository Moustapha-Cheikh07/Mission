// Charger les variables d'environnement
require('dotenv').config({ path: __dirname + '/../.env.production' });

const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { createModuleLogger } = require('./logger');
const db = require('./database-manager');
const cacheManager = require('./cache-manager');
const ilotCacheManager = require('./ilot-cache-manager');
const productReferences = require('./product-references');

// Logger pour le module serveur
const log = createModuleLogger('SERVER');

const app = express();

// Configuration multi-environnements
const ENV = process.env.NODE_ENV || 'development';
log.info(`Environment: ${ENV}`);
console.log(`🌍 Environment: ${ENV}`);

// Configuration par défaut selon l'environnement
const PORT = process.env.PORT || 1880;
const HOST = process.env.HOST || 'localhost';
log.info(`Configuration: HOST=${HOST}, PORT=${PORT}`);

// Enable CORS for all requests
app.use(cors({
    origin: '*', // En production, remplacer par l'URL spécifique du frontend
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// ========================================
// SYSTÈME DE CACHE AUTOMATIQUE
// ========================================
// Le fichier Excel est lu UNE fois par jour à 8h00 du matin
// et converti en JSON pour des performances ultra-rapides
// Lecture Excel: ~55s → Lecture JSON: ~0.05s (1000x plus rapide)

// Tâche planifiée : tous les jours à 8h00 du matin (cache principal)
cron.schedule('0 8 * * *', async () => {
    console.log('\n⏰ [CRON] Tâche planifiée déclenchée : 08h00');
    await cacheManager.refreshCache();
}, {
    timezone: "Europe/Paris"
});

// Tâche planifiée : tous les jours à 8h30 (caches îlots pour écrans d'atelier)
cron.schedule('30 8 * * *', async () => {
    console.log('\n⏰ [CRON] Tâche planifiée déclenchée : 08h30 - Rafraîchissement caches îlots');
    await ilotCacheManager.refreshIlotCaches();
}, {
    timezone: "Europe/Paris"
});

// Initialiser les caches au démarrage du serveur
console.log('🚀 Initialisation des caches au démarrage...');
cacheManager.refreshCache().then(result => {
    if (result.success) {
        console.log('✅ Cache principal initialisé avec succès au démarrage');
    } else {
        console.error('❌ Échec de l\'initialisation du cache principal');
    }
});

// Initialiser les caches îlots au démarrage
ilotCacheManager.refreshIlotCaches().then(result => {
    if (result.success) {
        console.log('✅ Caches îlots initialisés avec succès au démarrage');
    } else {
        console.error('❌ Échec de l\'initialisation des caches îlots');
    }
});

// Pré-charger les références 850MS au démarrage
console.log('🏭 Pré-chargement des références 850MS...');
const refsResult = productReferences.get850MSReferences();
if (refsResult.success) {
    console.log(`✅ ${refsResult.count} références 850MS pré-chargées en cache`);
} else {
    console.error('❌ Échec du pré-chargement des références 850MS');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadType = req.body.uploadType || 'documents';
        const uploadDir = path.join(__dirname, '..', 'assets', uploadType);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ========================================
// EXCEL DATA API (utilise le cache JSON ultra-rapide)
// ========================================

app.get('/api/data', (req, res) => {
    try {
        // Lire depuis le cache JSON (0.05s au lieu de 55s)
        const cacheData = cacheManager.readCache();

        if (!cacheData.success) {
            return res.status(500).json({
                error: 'Erreur lors de la lecture du cache',
                details: cacheData.error,
                cacheExists: cacheData.cacheExists
            });
        }

        // Retourner les données du cache
        res.json(cacheData);

    } catch (error) {
        console.error('❌ Erreur lors de la lecture des données:', error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error.message
        });
    }
});

// ========================================
// QUALITY DOCUMENTS API
// ========================================

// Get all quality documents
app.get('/api/documents/quality', async (req, res) => {
    try {
        const docs = await db.getQualityDocuments();
        res.json({ success: true, data: docs });
    } catch (error) {
        console.error('Error fetching quality documents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get quality documents by machine
app.get('/api/documents/quality/:machine', async (req, res) => {
    try {
        const docs = await db.getQualityDocumentsByMachine(req.params.machine);
        res.json({ success: true, data: docs });
    } catch (error) {
        console.error('Error fetching quality documents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload quality document
app.post('/api/documents/quality', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const doc = {
            title: req.body.title,
            category: req.body.category,
            machine: req.body.machine,
            description: req.body.description || '',
            filename: req.file.originalname,
            filepath: `/assets/documents/${req.file.filename}`,
            uploaded_by: req.body.uploaded_by || 'Anonymous'
        };

        const result = await db.addQualityDocument(doc);
        res.json({ success: true, id: result.lastID, document: doc });
    } catch (error) {
        console.error('Error uploading quality document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete quality document
app.delete('/api/documents/quality/:id', async (req, res) => {
    try {
        await db.deleteQualityDocument(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting quality document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// TRAINING DOCUMENTS API
// ========================================

// Get all training documents
app.get('/api/documents/training', async (req, res) => {
    try {
        const docs = await db.getTrainingDocuments();
        res.json({ success: true, data: docs });
    } catch (error) {
        console.error('Error fetching training documents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload training document
app.post('/api/documents/training', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const doc = {
            title: req.body.title,
            category: req.body.category,
            description: req.body.description || '',
            filename: req.file.originalname,
            filepath: `/assets/training/${req.file.filename}`,
            uploaded_by: req.body.uploaded_by || 'Anonymous'
        };

        const result = await db.addTrainingDocument(doc);
        res.json({ success: true, id: result.lastID, document: doc });
    } catch (error) {
        console.error('Error uploading training document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete training document
app.delete('/api/documents/training/:id', async (req, res) => {
    try {
        await db.deleteTrainingDocument(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting training document:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// FICHE ETOILE API
// ========================================

// Get all fiches etoile
app.get('/api/fiches-etoile', async (req, res) => {
    try {
        const fiches = await db.getFichesEtoile();
        res.json({ success: true, data: fiches });
    } catch (error) {
        console.error('Error fetching fiches etoile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get fiche etoile by ID
app.get('/api/fiches-etoile/:id', async (req, res) => {
    try {
        const fiche = await db.getFicheEtoileById(req.params.id);
        if (!fiche) {
            return res.status(404).json({ success: false, error: 'Fiche not found' });
        }
        res.json({ success: true, data: fiche });
    } catch (error) {
        console.error('Error fetching fiche etoile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get fiches etoile by status
app.get('/api/fiches-etoile/status/:status', async (req, res) => {
    try {
        const fiches = await db.getFichesEtoileByStatus(req.params.status);
        res.json({ success: true, data: fiches });
    } catch (error) {
        console.error('Error fetching fiches etoile by status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search fiches etoile
app.get('/api/fiches-etoile/search/:term', async (req, res) => {
    try {
        const fiches = await db.searchFichesEtoile(req.params.term);
        res.json({ success: true, data: fiches });
    } catch (error) {
        console.error('Error searching fiches etoile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate next NNCP number
app.get('/api/fiches-etoile/generate-numero', async (req, res) => {
    try {
        const numero = await db.generateNumeroNNCP();
        res.json({ success: true, numero_nncp: numero });
    } catch (error) {
        console.error('Error generating NNCP numero:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to normalize date (avoid timezone issues)
function normalizeDate(dateString) {
    if (!dateString) return dateString;

    // Si déjà au format YYYY-MM-DD, retourner tel quel
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // Si format avec timestamp, extraire juste la date
    if (dateString.includes('T')) {
        return dateString.split('T')[0];
    }

    return dateString;
}

// Create fiche etoile
app.post('/api/fiches-etoile', async (req, res) => {
    try {
        // Générer automatiquement le numéro NNCP si non fourni
        const numero_nncp = req.body.numero_nncp || await db.generateNumeroNNCP();

        const fiche = {
            numero_nncp: numero_nncp,
            reference: req.body.reference,
            libelle: req.body.libelle,
            quantite: req.body.quantite,
            prix_unitaire: req.body.prix_unitaire,
            date_production: normalizeDate(req.body.date_production),
            operateur: req.body.operateur || 'Non spécifié',
            probleme: req.body.probleme || 'Non spécifié',
            decision_49ms: req.body.decision_49ms || false,
            status: req.body.status || 'pending'
        };

        const result = await db.addFicheEtoile(fiche);
        res.json({
            success: true,
            id: result.lastID,
            numero_nncp: numero_nncp,
            fiche: fiche
        });
    } catch (error) {
        console.error('Error creating fiche etoile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update fiche etoile
app.put('/api/fiches-etoile/:id', async (req, res) => {
    try {
        // Recalculer automatiquement le statut basé sur decision_49ms
        let status = req.body.status || 'pending';
        if (req.body.decision_49ms === true || req.body.decision_49ms === 'true') {
            status = 'completed'; // Si 49MS coché → Vérifié
        } else if (req.body.decision_49ms === false || req.body.decision_49ms === 'false') {
            status = 'pending'; // Si 49MS non coché → En attente
        }

        const fiche = {
            reference: req.body.reference,
            libelle: req.body.libelle,
            quantite: req.body.quantite,
            prix_unitaire: req.body.prix_unitaire,
            date_production: normalizeDate(req.body.date_production),
            operateur: req.body.operateur,
            probleme: req.body.probleme,
            decision_49ms: req.body.decision_49ms,
            status: status // Utiliser le statut recalculé
        };

        const result = await db.updateFicheEtoile(req.params.id, fiche);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Fiche not found' });
        }

        // Retourner aussi le numero_nncp pour la confirmation frontend
        res.json({
            success: true,
            changes: result.changes,
            numero_nncp: req.body.numero_nncp
        });
    } catch (error) {
        console.error('Error updating fiche etoile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update fiche etoile status only
app.patch('/api/fiches-etoile/:id/status', async (req, res) => {
    try {
        const result = await db.updateFicheEtoile(req.params.id, { status: req.body.status });
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Fiche not found' });
        }
        res.json({ success: true, changes: result.changes });
    } catch (error) {
        console.error('Error updating fiche etoile status:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update decision 49MS
app.patch('/api/fiches-etoile/:id/decision-49ms', async (req, res) => {
    try {
        const result = await db.updateFicheEtoile(req.params.id, { decision_49ms: req.body.decision_49ms });
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Fiche not found' });
        }
        res.json({ success: true, changes: result.changes });
    } catch (error) {
        console.error('Error updating decision 49MS:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete fiche etoile
app.delete('/api/fiches-etoile/:id', async (req, res) => {
    try {
        await db.deleteFicheEtoile(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting fiche etoile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// PRODUCT REFERENCES API (850MS)
// ========================================

// Get all 850MS references
app.get('/api/references/850ms', (req, res) => {
    try {
        const result = productReferences.get850MSReferences();
        res.json(result);
    } catch (error) {
        console.error('Error fetching 850MS references:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Search references
app.get('/api/references/850ms/search/:term', (req, res) => {
    try {
        const result = productReferences.searchReference(req.params.term);
        res.json(result);
    } catch (error) {
        console.error('Error searching references:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get specific reference info
app.get('/api/references/850ms/:material', (req, res) => {
    try {
        const result = productReferences.getReferenceInfo(req.params.material);
        res.json(result);
    } catch (error) {
        console.error('Error getting reference info:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// CACHE MANAGEMENT API
// ========================================

// Forcer le rafraîchissement du cache manuellement (pour tests)
app.post('/api/cache/refresh', async (req, res) => {
    try {
        console.log('🔄 [API] Rafraîchissement manuel du cache demandé');
        const result = await cacheManager.refreshCache();

        if (result.success) {
            res.json({
                success: true,
                message: 'Cache rafraîchi avec succès',
                duration: result.duration,
                totalRows: result.totalRows,
                filteredRows: result.filteredRows
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement du cache:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtenir les informations sur le cache
app.get('/api/cache/info', (req, res) => {
    try {
        const info = cacheManager.getCacheInfo();
        res.json(info);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des infos du cache:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// ÎLOTS CACHE API (pour écrans d'atelier)
// ========================================

// Obtenir les données d'un îlot spécifique
app.get('/api/ilot/:ilotName', (req, res) => {
    try {
        const ilotName = req.params.ilotName.toUpperCase();
        const ilotData = ilotCacheManager.readIlotCache(ilotName);

        if (!ilotData.success) {
            return res.status(404).json({
                error: `Données non disponibles pour l'îlot ${ilotName}`,
                details: ilotData.error
            });
        }

        res.json(ilotData);

    } catch (error) {
        console.error(`❌ Erreur lors de la lecture des données îlot ${req.params.ilotName}:`, error);
        res.status(500).json({
            error: 'Erreur interne du serveur',
            details: error.message
        });
    }
});

// Rafraîchir tous les caches îlots manuellement
app.post('/api/ilots/refresh', async (req, res) => {
    try {
        console.log('🔄 [API] Rafraîchissement manuel des caches îlots demandé');
        const result = await ilotCacheManager.refreshIlotCaches();

        if (result.success) {
            res.json({
                success: true,
                message: 'Caches îlots rafraîchis avec succès',
                duration: result.duration,
                results: result.results
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement des caches îlots:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Obtenir les informations sur tous les caches îlots
app.get('/api/ilots/info', (req, res) => {
    try {
        const info = ilotCacheManager.getIlotCachesInfo();
        res.json(info);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des infos caches îlots:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// ========================================
// SERVE STATIC FILES
// ========================================

// Servir les fichiers uploadés (documents, training)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Servir les fichiers statiques (le site web)
app.use(express.static(path.join(__dirname, '../frontend')));

// ========================================
// START SERVER
// ========================================

// Wait for database to be ready before starting server
async function startServer() {
    try {
        // Wait for database initialization
        await db.ready;
        console.log('✅ Database ready');
    } catch (error) {
        console.warn('⚠️  Database initialization failed, continuing in limited mode');
    }

    // Start the server
    app.listen(PORT, HOST, () => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log(`📡 Accessible depuis le réseau local`);
        console.log(`🌐 URL Frontend: http://${HOST}:${PORT}`);
        console.log(`📊 API Endpoint: http://${HOST}:${PORT}/api`);
        console.log(`${'='.repeat(60)}\n`);
    });
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    db.close();
    process.exit(0);
});
