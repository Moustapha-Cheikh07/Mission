const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Configuration des chemins
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
const CACHE_DIR = path.join(__dirname, 'cache');

// Liste des îlots
const ILOTS = ['PM1', 'PM2', 'BZ1', 'BZ2', 'GRM'];

// Créer le dossier cache s'il n'existe pas
if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Identifie l'îlot d'une machine
 */
function getIlotFromMachine(machine) {
    const machineStr = String(machine || '').toUpperCase();

    // Mapping des machines vers les îlots (basé sur les données réelles - 71 machines totales)

    // PM1: 850MS135, 850MS122, 850MS123, 850MS125
    if (machineStr.includes('850MS135') || machineStr.includes('850MS122') ||
        machineStr.includes('850MS123') || machineStr.includes('850MS125')) {
        return 'PM1';
    }

    // PM2: 850MS143, 850MS146, 850MS150, 850MS158
    else if (machineStr.includes('850MS143') || machineStr.includes('850MS146') ||
               machineStr.includes('850MS150') || machineStr.includes('850MS158')) {
        return 'PM2';
    }

    // BZ1: 850MS157, 850MS104, 850MS077, 850MS087
    else if (machineStr.includes('850MS157') || machineStr.includes('850MS104') ||
               machineStr.includes('850MS077') || machineStr.includes('850MS087')) {
        return 'BZ1';
    }

    // BZ2: 850MS071, 850MS130, 850MS155, 850MS073
    else if (machineStr.includes('850MS071') || machineStr.includes('850MS130') ||
               machineStr.includes('850MS155') || machineStr.includes('850MS073')) {
        return 'BZ2';
    }

    // GRM: 850MS070, 850MS085, 850MS086, 850MS161, 850MS120, 850MS144, 850MS091, 850MS117
    else if (machineStr.includes('850MS070') || machineStr.includes('850MS085') ||
               machineStr.includes('850MS086') || machineStr.includes('850MS161') ||
               machineStr.includes('850MS120') || machineStr.includes('850MS144') ||
               machineStr.includes('850MS091') || machineStr.includes('850MS117')) {
        return 'GRM';
    }

    return 'UNKNOWN';
}

/**
 * Parse un nombre avec virgule ou point décimal
 */
function parseNumber(value) {
    if (!value) return 0;
    // Convertir en string et remplacer virgule par point
    const str = String(value).replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

/**
 * Calcule les statistiques pour un îlot
 */
function calculateIlotStats(ilotData) {
    let totalRejectCost = 0;
    let totalRejectQuantity = 0;
    let totalProduction = 0;
    let totalRevenue = 0;

    const machineStats = {};
    const rejectsByReason = {};
    const productionByMachine = {};

    ilotData.forEach(row => {
        // Trouver les colonnes dynamiquement
        const machineKey = Object.keys(row).find(key =>
            key.toLowerCase().includes('workcenter') || key.toLowerCase().includes('machine')
        );
        const rejectQtyKey = Object.keys(row).find(key =>
            key.toLowerCase().includes('qte scrap') || key.toLowerCase().includes('quantity')
        );
        const prodQtyKey = Object.keys(row).find(key =>
            key.toLowerCase().includes('qte prod') || key.toLowerCase().includes('production')
        );
        const priceKey = Object.keys(row).find(key =>
            key.toLowerCase().includes('prix') || key.toLowerCase().includes('price')
        );
        const reasonKey = Object.keys(row).find(key =>
            key.toLowerCase().includes('motif') || key.toLowerCase().includes('reason')
        );

        const machine = row[machineKey] || 'Unknown';
        const rejectQty = parseNumber(row[rejectQtyKey]);
        const prodQty = parseNumber(row[prodQtyKey]);
        const price = parseNumber(row[priceKey]);
        const reason = row[reasonKey] || 'Non spécifié';

        // FILTRAGE: Ignorer les lignes sans rebuts (comme le fait le tableau de bord)
        if (rejectQty <= 0) {
            return; // Skip cette ligne
        }

        // Coûts et quantités
        const rejectCost = rejectQty * price;
        totalRejectCost += rejectCost;
        totalRejectQuantity += rejectQty;
        totalProduction += prodQty;
        totalRevenue += prodQty * price;

        // Stats par machine
        if (!machineStats[machine]) {
            machineStats[machine] = {
                machine: machine,
                rejectQuantity: 0,
                rejectCost: 0,
                production: 0
            };
        }
        machineStats[machine].rejectQuantity += rejectQty;
        machineStats[machine].rejectCost += rejectCost;
        machineStats[machine].production += prodQty;

        // Stats par motif de rebut
        if (rejectQty > 0) {
            if (!rejectsByReason[reason]) {
                rejectsByReason[reason] = {
                    reason: reason,
                    quantity: 0,
                    cost: 0
                };
            }
            rejectsByReason[reason].quantity += rejectQty;
            rejectsByReason[reason].cost += rejectCost;
        }

        // Production par machine
        if (!productionByMachine[machine]) {
            productionByMachine[machine] = 0;
        }
        productionByMachine[machine] += prodQty;
    });

    // Calculer le taux de rebut
    const rejectRate = totalProduction > 0
        ? ((totalRejectQuantity / (totalProduction + totalRejectQuantity)) * 100).toFixed(2)
        : 0;

    return {
        summary: {
            totalRejectCost: totalRejectCost.toFixed(2),
            totalRejectQuantity: totalRejectQuantity.toFixed(0),
            totalProduction: totalProduction.toFixed(0),
            totalRevenue: totalRevenue.toFixed(2),
            rejectRate: rejectRate
        },
        machineStats: Object.values(machineStats).sort((a, b) => b.rejectCost - a.rejectCost),
        rejectsByReason: Object.values(rejectsByReason).sort((a, b) => b.cost - a.cost),
        productionByMachine: productionByMachine
    };
}

/**
 * Rafraîchir les caches de tous les îlots
 * Cette fonction est appelée à 8h30 chaque matin
 */
async function refreshIlotCaches() {
    const startTime = Date.now();
    console.log('\n🔄 [ÎLOTS CACHE] Début de la mise à jour des caches îlots...');
    console.log(`📅 Date/Heure : ${new Date().toLocaleString('fr-FR')}`);

    try {
        // Vérifier si le fichier Excel existe
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            throw new Error(`Fichier Excel non trouvé : ${EXCEL_FILE_PATH}`);
        }

        // Lire le fichier Excel
        console.log(`📖 Lecture du fichier Excel : ${EXCEL_FILE_PATH}`);
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd'
        });

        // Grouper les données par îlot
        const dataByIlot = {};
        ILOTS.forEach(ilot => dataByIlot[ilot] = []);

        jsonData.forEach(row => {
            const machineKey = Object.keys(row).find(key =>
                key.toLowerCase().includes('workcenter') || key.toLowerCase().includes('machine')
            );

            if (machineKey) {
                const machine = row[machineKey];
                const ilot = getIlotFromMachine(machine);

                // Filtrer: inclure seulement les lignes avec des rebuts (scrapQuantity > 0)
                const rejectQtyKey = Object.keys(row).find(key =>
                    key.toLowerCase().includes('qte scrap') || key.toLowerCase().includes('quantity')
                );
                const rejectQty = parseNumber(row[rejectQtyKey]);

                if (ilot !== 'UNKNOWN' && dataByIlot[ilot] && rejectQty > 0) {
                    dataByIlot[ilot].push(row);
                }
            }
        });

        // Créer un cache pour chaque îlot
        const results = {};

        for (const ilot of ILOTS) {
            const ilotData = dataByIlot[ilot];
            const stats = calculateIlotStats(ilotData);

            const cacheData = {
                ilot: ilot,
                success: true,
                count: ilotData.length,
                cacheCreatedAt: new Date().toISOString(),
                lastUpdate: new Date().toLocaleString('fr-FR'),
                stats: stats,
                rawData: ilotData
            };

            // Écrire le cache dans un fichier JSON
            const cacheFilePath = path.join(CACHE_DIR, `${ilot.toLowerCase()}-data.json`);
            fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');

            results[ilot] = {
                success: true,
                recordCount: ilotData.length,
                filePath: cacheFilePath
            };

            console.log(`✅ [${ilot}] Cache créé : ${ilotData.length} enregistrements`);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`\n✅ [ÎLOTS CACHE] Mise à jour terminée avec succès`);
        console.log(`⏱️  Durée totale : ${duration}s`);
        console.log(`💾 ${ILOTS.length} fichiers cache créés dans : ${CACHE_DIR}`);
        console.log(`🔥 Les pages îlots chargeront instantanément jusqu'à demain 8h30\n`);

        return {
            success: true,
            duration,
            results
        };

    } catch (error) {
        console.error('❌ [ÎLOTS CACHE] Erreur lors de la mise à jour:', error.message);
        console.error(error.stack);

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Lit le cache d'un îlot spécifique
 */
function readIlotCache(ilot) {
    try {
        const cacheFilePath = path.join(CACHE_DIR, `${ilot.toLowerCase()}-data.json`);

        if (!fs.existsSync(cacheFilePath)) {
            return {
                success: false,
                error: `Cache non trouvé pour l'îlot ${ilot}`,
                cacheExists: false
            };
        }

        const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
        const cacheData = JSON.parse(cacheContent);

        return cacheData;

    } catch (error) {
        console.error(`❌ [ÎLOTS CACHE] Erreur lecture cache ${ilot}:`, error);
        return {
            success: false,
            error: error.message,
            cacheExists: false
        };
    }
}

/**
 * Obtenir les informations sur tous les caches îlots
 */
function getIlotCachesInfo() {
    const info = {};

    ILOTS.forEach(ilot => {
        const cacheFilePath = path.join(CACHE_DIR, `${ilot.toLowerCase()}-data.json`);

        if (fs.existsSync(cacheFilePath)) {
            const stats = fs.statSync(cacheFilePath);
            const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
            const cacheData = JSON.parse(cacheContent);

            info[ilot] = {
                exists: true,
                path: cacheFilePath,
                size: `${(stats.size / 1024).toFixed(2)} KB`,
                lastModified: stats.mtime,
                cacheCreatedAt: cacheData.cacheCreatedAt,
                recordCount: cacheData.count
            };
        } else {
            info[ilot] = {
                exists: false,
                message: 'Cache non initialisé'
            };
        }
    });

    return info;
}

module.exports = {
    refreshIlotCaches,
    readIlotCache,
    getIlotCachesInfo,
    ILOTS
};
