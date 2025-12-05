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

// Fonction pour trouver le fichier de prix (gestion des encodages)
function findPriceFile() {
    const dataDir = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataDir);

    // Chercher un fichier qui commence par "Prix" et contient "2025" et finit par ".xlsx"
    const priceFile = files.find(f => {
        const lower = f.toLowerCase();
        return lower.startsWith('prix') &&
               lower.includes('2025') &&
               lower.endsWith('.xlsx') &&
               !lower.startsWith('~$'); // Exclure les fichiers temporaires Excel
    });

    if (priceFile) {
        return path.join(dataDir, priceFile);
    }
    return null;
}

// Créer le dossier cache s'il n'existe pas
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Charge les prix depuis le fichier "Prix pièces 2025.xlsx"
 * Retourne un Map avec Material => Prix unitaire
 */
function loadPrices() {
    try {
        log.info('Chargement des prix depuis Prix pièces 2025.xlsx...');
        console.log('💰 [PRIX] Chargement des prix...');

        // Trouver le fichier de prix
        const PRICE_FILE_PATH = findPriceFile();

        if (!PRICE_FILE_PATH) {
            log.warn('Prix file not found in data directory');
            console.warn('⚠️  [PRIX] Fichier de prix introuvable, utilisation des prix SAP par défaut');
            return null;
        }

        console.log(`💰 [PRIX] Fichier trouvé: ${path.basename(PRICE_FILE_PATH)}`);

        // Lire le fichier Excel des prix
        const priceWorkbook = xlsx.readFile(PRICE_FILE_PATH);
        const priceSheetName = priceWorkbook.SheetNames[0];
        const priceWorksheet = priceWorkbook.Sheets[priceSheetName];
        const priceData = xlsx.utils.sheet_to_json(priceWorksheet, { raw: false });

        // Créer un Map pour accès rapide Material => Prix
        const priceMap = new Map();

        priceData.forEach((row, index) => {
            // Chercher la colonne Material
            const material = row['Material'] || row['material'] || row['MATERIAL'];

            // Chercher la colonne DVC 2025 (prix pour 1000 pièces)
            const priceFor1000 = row['DVC 2025'] || row['DVC2025'] || row['dvc 2025'];

            if (material && priceFor1000) {
                // Nettoyer et convertir le prix
                let priceValue = priceFor1000;

                if (typeof priceValue === 'string') {
                    // Enlever le symbole € et les espaces
                    priceValue = priceValue.replace('€', '').trim();
                    // Enlever les virgules (séparateur de milliers): 54,121.55 → 54121.55
                    priceValue = priceValue.replace(/,/g, '');
                    // Le point reste comme séparateur décimal
                }

                const priceNum = parseFloat(priceValue);

                if (!isNaN(priceNum) && priceNum > 0) {
                    // IMPORTANT: Diviser par 1000 car les prix sont pour 1000 pièces
                    // Exemple: 54121.55€ / 1000 = 54.12155€/pièce
                    const unitPrice = priceNum / 1000;
                    priceMap.set(String(material).trim(), unitPrice);

                    // Log des 3 premiers prix pour debug
                    if (index < 3) {
                        log.info(`Exemple prix: ${material} = ${priceNum.toFixed(2)}€/1000pcs → ${unitPrice.toFixed(5)}€/pc`);
                        console.log(`   ${material}: ${priceNum.toFixed(2)}€/1000pcs → ${unitPrice.toFixed(5)}€/pc`);
                    }
                }
            }
        });

        log.info(`${priceMap.size} prix chargés depuis le fichier Excel`);
        console.log(`✅ [PRIX] ${priceMap.size} prix chargés avec succès`);

        return priceMap;

    } catch (error) {
        log.error('Erreur lors du chargement des prix:', error);
        console.error('❌ [PRIX] Erreur:', error.message);
        return null;
    }
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
        // Charger les prix depuis le fichier Excel
        const priceMap = loadPrices();

        // Vérifier si le fichier Excel SAP existe
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

        // Enrichir les données avec les prix unitaires corrects
        let pricesApplied = 0;
        let pricesNotFound = 0;

        if (priceMap) {
            console.log('💰 [PRIX] Application des prix aux données...');

            filteredData.forEach(row => {
                // Trouver la colonne Material dans la ligne
                const materialKey = Object.keys(row).find(key => {
                    const lowerKey = key.toLowerCase();
                    return lowerKey === 'material' || lowerKey === 'matériel';
                });

                if (materialKey) {
                    const material = String(row[materialKey] || '').trim();

                    if (material) {
                        // Chercher le prix dans le priceMap
                        const unitPrice = priceMap.get(material);

                        if (unitPrice !== undefined) {
                            // Remplacer le prix unitaire par celui du fichier Prix
                            row['Prix UNIT'] = unitPrice;
                            pricesApplied++;
                        } else {
                            pricesNotFound++;
                        }
                    }
                }
            });

            console.log(`✅ [PRIX] ${pricesApplied} prix appliqués`);
            if (pricesNotFound > 0) {
                console.log(`⚠️  [PRIX] ${pricesNotFound} références sans prix trouvé (prix SAP conservé)`);
            }
        }

        // Préparer les métadonnées du cache
        const cacheData = {
            success: true,
            count: filteredData.length,
            totalRows: jsonData.length,
            pricesApplied: pricesApplied,
            pricesNotFound: pricesNotFound,
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
