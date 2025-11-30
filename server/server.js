const express = require('express');
const cors = require('cors');
const xlsx = require('xlsx');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const db = require('./database-mysql');
const cacheManager = require('./cache-manager');
const ilotCacheManager = require('./ilot-cache-manager');

const app = express();
const PORT = 3000;

// Enable CORS for all requests
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// ========================================
// SYSTÈME DE CACHE AUTOMATIQUE
// ========================================
// Le fichier Excel est lu UNE fois par jour à 3h00 du matin
// et converti en JSON pour des performances ultra-rapides
// Lecture Excel: ~55s → Lecture JSON: ~0.05s (1000x plus rapide)

// Tâche planifiée : tous les jours à 3h00 du matin (cache principal)
cron.schedule('0 3 * * *', async () => {
    console.log('\n⏰ [CRON] Tâche planifiée déclenchée : 03h00');
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

// Get fiches etoile by priority
app.get('/api/fiches-etoile/priority/:priority', async (req, res) => {
    try {
        const fiches = await db.getFichesEtoileByPriority(req.params.priority);
        res.json({ success: true, data: fiches });
    } catch (error) {
        console.error('Error fetching fiches etoile by priority:', error);
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

// Create fiche etoile
app.post('/api/fiches-etoile', async (req, res) => {
    try {
        const fiche = {
            reference: req.body.reference,
            emetteur: req.body.emetteur,
            date_fabrication: req.body.date_fabrication,
            date: req.body.date,
            quantite: req.body.quantite,
            avis_qualite: req.body.avis_qualite || '',
            description: req.body.description,
            actions: req.body.actions,
            delai: req.body.delai,
            status: req.body.status || 'pending',
            priority: req.body.priority || 'medium'
        };

        const result = await db.addFicheEtoile(fiche);
        res.json({ success: true, id: result.lastID, fiche: fiche });
    } catch (error) {
        console.error('Error creating fiche etoile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update fiche etoile
app.put('/api/fiches-etoile/:id', async (req, res) => {
    try {
        const fiche = {
            reference: req.body.reference,
            emetteur: req.body.emetteur,
            date_fabrication: req.body.date_fabrication,
            date: req.body.date,
            quantite: req.body.quantite,
            avis_qualite: req.body.avis_qualite,
            description: req.body.description,
            actions: req.body.actions,
            delai: req.body.delai,
            status: req.body.status,
            priority: req.body.priority
        };

        const result = await db.updateFicheEtoile(req.params.id, fiche);
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Fiche not found' });
        }
        res.json({ success: true, changes: result.changes });
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

// Update fiche etoile priority only
app.patch('/api/fiches-etoile/:id/priority', async (req, res) => {
    try {
        const result = await db.updateFicheEtoile(req.params.id, { priority: req.body.priority });
        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Fiche not found' });
        }
        res.json({ success: true, changes: result.changes });
    } catch (error) {
        console.error('Error updating fiche etoile priority:', error);
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

// Servir les fichiers statiques (le site web)
app.use(express.static(path.join(__dirname, '../')));

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 Serveur démarré sur http://localhost:' + PORT);
    console.log('========================================');
    console.log('📡 API Données (cache)  : http://localhost:' + PORT + '/api/data');
    console.log('🌐 Site web             : http://localhost:' + PORT);
    console.log('📄 Documents API        : http://localhost:' + PORT + '/api/documents');
    console.log('📝 Fiches Étoile API    : http://localhost:' + PORT + '/api/fiches-etoile');
    console.log('\n🔥 CACHE SYSTEM ACTIVÉ :');
    console.log('   ✅ Lecture JSON ultra-rapide (~0.05s)');
    console.log('   ⏰ Mise à jour auto : tous les jours à 3h00');
    console.log('\n📌 Gestion du cache :');
    console.log('   • Info cache         : GET  http://localhost:' + PORT + '/api/cache/info');
    console.log('   • Rafraîchir cache   : POST http://localhost:' + PORT + '/api/cache/refresh');
    console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Arrêt du serveur...');
    db.close();
    process.exit(0);
});
