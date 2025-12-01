const xlsx = require('xlsx');
const path = require('path');

// Lire le fichier Excel
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
const workbook = xlsx.readFile(EXCEL_FILE_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convertir en JSON
const data = xlsx.utils.sheet_to_json(worksheet, { raw: false });

console.log('📊 ANALYSE DU FICHIER EXCEL SAP\n');
console.log(`Total lignes: ${data.length}\n`);

// Afficher les noms de colonnes
if (data.length > 0) {
    console.log('📋 COLONNES DISPONIBLES:');
    Object.keys(data[0]).forEach((col, index) => {
        console.log(`  ${index + 1}. ${col}`);
    });
    console.log('\n');

    // Afficher quelques exemples de lignes 850MS
    console.log('📦 EXEMPLES DE DONNÉES 850MS:\n');
    const examples850MS = data.filter(row => {
        const machineKey = Object.keys(row).find(key =>
            key.toLowerCase().includes('workcenter') || key.toLowerCase().includes('machine')
        );
        if (machineKey) {
            const machine = String(row[machineKey] || '');
            return machine.startsWith('850MS');
        }
        return false;
    }).slice(0, 3);

    examples850MS.forEach((row, idx) => {
        console.log(`--- Exemple ${idx + 1} ---`);
        Object.keys(row).forEach(key => {
            if (key.toLowerCase().includes('material') ||
                key.toLowerCase().includes('designation') ||
                key.toLowerCase().includes('prix') ||
                key.toLowerCase().includes('workcenter')) {
                console.log(`  ${key}: ${row[key]}`);
            }
        });
        console.log('');
    });
}
