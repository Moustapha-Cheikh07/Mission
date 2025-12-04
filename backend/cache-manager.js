const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createModuleLogger } = require('./logger');

// Logger pour le module cache-manager
const log = createModuleLogger('CACHE-MANAGER');

// Configuration des chemins
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
const CACHE_DIR = path.join(__dirname, 'cache');
const CACHE_FILE_PATH = path.join(CACHE_DIR, 'data_cache.json');

// Créer le dossier cache s'il n'existe pas
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Lit le fichier Excel et le convertit en JSON
 * Cette fonction est appelée une fois par jour à 3h00
 */
async function refreshCache() {
    const startTime = Date.now();
    log.info('Starting cache refresh...');
    console.log('\n🔄 [CACHE] Début de la mise à jour du cache...');
    console.log(`📅 Date/Heure : ${new Date().toLocaleString('fr-FR')}`);

    try {
        // Vérifier si le fichier Excel existe
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            const error = `Excel file not found: ${EXCEL_FILE_PATH}`;
            log.error(error);
            throw new Error(error);
        }

        // Lire le fichier Excel
        log.info(`Reading Excel file: ${EXCEL_FILE_PATH}`);
        console.log(`📖 Lecture du fichier Excel : ${EXCEL_FILE_PATH}`);
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);

        // Convertir la première feuille en JSON
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd'
        });

        log.info(`Excel file read successfully, total rows: ${jsonData.length}`);

        // Filtrer les données (machines 850MS uniquement)
        const filteredData = jsonData.filter(row => {
            const machineKey = Object.keys(row).find(key => {
                const lowerKey = key.toLowerCase();
                return lowerKey === 'workcenter' || lowerKey.includes('machine');
            });

            if (!machineKey) return false;

            const machineValue = String(row[machineKey] || '');
            return machineValue.startsWith('850MS');
        });

        log.info(`Filtered 850MS rows: ${filteredData.length}`);

        // Préparer les métadonnées du cache
        const cacheData = {
            success: true,
            count: filteredData.length,
            totalRows: jsonData.length,
            lastModified: fs.statSync(EXCEL_FILE_PATH).mtime,
            cacheCreatedAt: new Date().toISOString(),
            data: filteredData
        };

        // Écrire le cache dans un fichier JSON
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData, null, 2), 'utf8');

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        log.info(`Cache refresh completed successfully in ${duration}s`, {
            totalRows: jsonData.length,
            filteredRows: filteredData.length,
            cachePath: CACHE_FILE_PATH
        });
        console.log(`✅ [CACHE] Mise à jour terminée avec succès`);
        console.log(`📊 Total lignes Excel : ${jsonData.length}`);
        console.log(`✅ Lignes 850MS filtrées : ${filteredData.length}`);
        console.log(`💾 Cache enregistré : ${CACHE_FILE_PATH}`);
        console.log(`⏱️  Durée : ${duration}s`);
        console.log(`🔥 Prochaines requêtes API : ~0.05s au lieu de ~${duration}s\n`);

        return {
            success: true,
            duration,
            totalRows: jsonData.length,
            filteredRows: filteredData.length
        };

    } catch (error) {
        log.error('Error during cache refresh', { error: error.message, stack: error.stack });
        console.error('❌ [CACHE] Erreur lors de la mise à jour du cache:', error.message);
        console.error(error.stack);

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Lit les données depuis le cache JSON (ultra rapide)
 */
function readCache() {
    try {
        // Vérifier si le cache existe
        if (!fs.existsSync(CACHE_FILE_PATH)) {
            log.warn('Cache not found, generating first cache...');
            console.warn('⚠️  [CACHE] Cache non trouvé. Génération du premier cache...');
            // Créer le cache de manière synchrone pour la première fois
            refreshCache();

            // Si toujours pas de cache, retourner une erreur
            if (!fs.existsSync(CACHE_FILE_PATH)) {
                log.error('Cache not found and cannot be generated');
                return {
                    success: false,
                    error: 'Cache introuvable et impossible à générer',
                    cacheExists: false
                };
            }
        }

        // Lire le fichier JSON (ultra rapide : ~0.05s)
        log.debug('Reading cache file');
        const cacheContent = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
        const cacheData = JSON.parse(cacheContent);

        log.debug('Cache file read successfully');
        return cacheData;

    } catch (error) {
        log.error('Error reading cache file', { error: error.message });
        console.error('❌ [CACHE] Erreur lors de la lecture du cache:', error);
        return {
            success: false,
            error: error.message,
            cacheExists: fs.existsSync(CACHE_FILE_PATH)
        };
    }
}

/**
 * Obtenir les informations sur le cache
 */
function getCacheInfo() {
    try {
        if (!fs.existsSync(CACHE_FILE_PATH)) {
            return {
                exists: false,
                message: 'Cache non initialisé'
            };
        }

        const stats = fs.statSync(CACHE_FILE_PATH);
        const cacheContent = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
        const cacheData = JSON.parse(cacheContent);

        return {
            exists: true,
            path: CACHE_FILE_PATH,
            size: `${(stats.size / 1024).toFixed(2)} KB`,
            lastModified: stats.mtime,
            cacheCreatedAt: cacheData.cacheCreatedAt,
            recordCount: cacheData.count,
            totalRows: cacheData.totalRows
        };

    } catch (error) {
        return {
            exists: false,
            error: error.message
        };
    }
}

module.exports = {
    refreshCache,
    readCache,
    getCacheInfo,
    CACHE_FILE_PATH,
    EXCEL_FILE_PATH
};
