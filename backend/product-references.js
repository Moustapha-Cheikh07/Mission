const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Configuration des chemins
// Utiliser la variable d'environnement ou le chemin par défaut
const EXCEL_FILE_PATH = process.env.EXCEL_FILE_PATH
    ? (path.isAbsolute(process.env.EXCEL_FILE_PATH)
        ? process.env.EXCEL_FILE_PATH
        : path.join(__dirname, process.env.EXCEL_FILE_PATH))
    : path.join(__dirname, 'data', 'sap_export.xlsx');

// Cache en mémoire pour les références 850MS
let referencesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure en millisecondes

/**
 * Charge les références 850MS depuis l'Excel (avec mise en cache)
 */
function loadReferencesFromExcel() {
    try {
        console.log('📖 Lecture du fichier Excel pour les références 850MS...');

        // Vérifier si le fichier Excel existe
        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            throw new Error(`Fichier Excel non trouvé : ${EXCEL_FILE_PATH}`);
        }

        // Lire le fichier Excel
        const workbook = xlsx.readFile(EXCEL_FILE_PATH);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir en JSON
        const jsonData = xlsx.utils.sheet_to_json(worksheet, {
            raw: false,
            dateNF: 'yyyy-mm-dd'
        });

        // Map pour stocker les références uniques
        const referencesMap = new Map();

        // Parcourir toutes les lignes
        jsonData.forEach(row => {
            // Trouver les colonnes dynamiquement
            const machineKey = Object.keys(row).find(key =>
                key.toLowerCase().includes('workcenter') || key.toLowerCase().includes('machine')
            );
            const materialKey = Object.keys(row).find(key =>
                key.toLowerCase() === 'material'
            );
            const designationKey = Object.keys(row).find(key =>
                key.toLowerCase().includes('designation') && key.toLowerCase().includes('material')
            );
            const priceKey = Object.keys(row).find(key =>
                key.toLowerCase().includes('prix') && key.toLowerCase().includes('unit')
            );

            // Vérifier si c'est une machine 850MS
            if (machineKey && materialKey) {
                const machine = String(row[machineKey] || '');
                const material = String(row[materialKey] || '');

                if (machine.startsWith('850MS') && material) {
                    // Stocker uniquement si pas déjà présent ou pour mettre à jour les infos
                    if (!referencesMap.has(material)) {
                        const designation = designationKey ? row[designationKey] : '';
                        const prixStr = priceKey ? String(row[priceKey] || '0') : '0';
                        // Convertir le prix (virgule vers point)
                        const prix = parseFloat(prixStr.replace(',', '.')) || 0;

                        referencesMap.set(material, {
                            reference: material,
                            libelle: designation,
                            prix_unitaire: prix
                        });
                    }
                }
            }
        });

        // Convertir le Map en tableau et trier par référence
        const references = Array.from(referencesMap.values())
            .sort((a, b) => a.reference.localeCompare(b.reference));

        console.log(`✅ ${references.length} références 850MS chargées et mises en cache`);

        return {
            success: true,
            count: references.length,
            data: references
        };

    } catch (error) {
        console.error('❌ Erreur lors de la récupération des références 850MS:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
}

/**
 * Récupère toutes les références de produits 850MS (utilise le cache si disponible)
 */
function get850MSReferences() {
    const now = Date.now();

    // Vérifier si le cache est valide
    if (referencesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
        console.log('⚡ Utilisation du cache pour les références 850MS');
        return referencesCache;
    }

    // Recharger depuis l'Excel
    const result = loadReferencesFromExcel();

    // Mettre en cache si succès
    if (result.success) {
        referencesCache = result;
        cacheTimestamp = now;
    }

    return result;
}

/**
 * Recherche une référence spécifique
 */
function searchReference(searchTerm) {
    try {
        const allRefs = get850MSReferences();

        if (!allRefs.success) {
            return allRefs;
        }

        const term = searchTerm.toLowerCase();
        const filtered = allRefs.data.filter(ref =>
            ref.reference.toLowerCase().includes(term) ||
            ref.libelle.toLowerCase().includes(term)
        );

        return {
            success: true,
            count: filtered.length,
            data: filtered
        };

    } catch (error) {
        console.error('❌ Erreur lors de la recherche de référence:', error);
        return {
            success: false,
            error: error.message,
            data: []
        };
    }
}

/**
 * Récupère les informations d'une référence spécifique
 */
function getReferenceInfo(material) {
    try {
        const allRefs = get850MSReferences();

        if (!allRefs.success) {
            return allRefs;
        }

        const ref = allRefs.data.find(r => r.reference === material);

        if (!ref) {
            return {
                success: false,
                error: 'Référence non trouvée'
            };
        }

        return {
            success: true,
            data: ref
        };

    } catch (error) {
        console.error('❌ Erreur lors de la récupération de la référence:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    get850MSReferences,
    searchReference,
    getReferenceInfo
};
