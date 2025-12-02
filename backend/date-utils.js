/**
 * Utilitaires pour gérer les dates sans problème de timezone
 */

/**
 * Convertir un objet Date MySQL en string YYYY-MM-DD
 * Avec dateStrings: true dans la config MySQL, les dates arrivent déjà comme des chaînes
 * @param {Date|string} dateValue - Date depuis MySQL
 * @returns {string} - Date au format YYYY-MM-DD
 */
function convertMySQLDateToString(dateValue) {
    if (!dateValue) return null;

    // Avec typeCast dans la config MySQL, les dates arrivent TOUJOURS comme des chaînes "2025-12-02"
    // Aucune conversion nécessaire, on retourne directement
    const dateStr = String(dateValue);

    // Si timestamp ISO (YYYY-MM-DDTHH:MM:SS.sssZ), extraire juste la date
    if (dateStr.includes('T')) {
        return dateStr.split('T')[0];
    }

    // Retourner tel quel (déjà au format YYYY-MM-DD)
    return dateStr;
}

/**
 * Traiter un tableau de fiches pour convertir les dates
 * @param {Array} rows - Tableau de fiches
 * @returns {Array} - Fiches avec dates converties
 */
function convertFicheDates(rows) {
    if (!Array.isArray(rows)) return rows;

    return rows.map(row => {
        if (row.date_production) {
            row.date_production = convertMySQLDateToString(row.date_production);
        }
        return row;
    });
}

module.exports = {
    convertMySQLDateToString,
    convertFicheDates
};
