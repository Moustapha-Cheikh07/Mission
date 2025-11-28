const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const FILE_PATH = path.join(DATA_DIR, 'sap_export.xlsx');

// Configuration
const NUM_ROWS = 200; // Nombre de lignes à générer
const DAYS_BACK = 45; // Période (jours)

// Données de référence
const MACHINES = [
    // PM1
    "850MS122", "850MS123", "850MS135", "850MS125",
    // PM2
    "850MS158", "850MS150", "850MS146", "850MS143",
    // BZ1
    "850MS151", "850MS157", "850MS104",
    // BZ2
    "850MS130", "850MS71", "850MS87", "850MS73", "850MS155",
    // GRM
    "850MS70", "850MS85", "850MS86", "850MS120", "850MS91", "850MS144"
];

const MATERIALS = [
    { code: "04294964BE-EMB", desc: "MAGNETIC CONTACT FRAME", price: 0.07601 },
    { code: "AAV83736-OTS", desc: "20A MULTIPOLAR THERMAL SUB-ASSEMBLY", price: 0.12173 },
    { code: "04290013AC-EMB", desc: "MAGNETIC CONTACT FRAME 25A", price: 0.10502 },
    { code: "BBV45892-XYZ", desc: "BOBINE 220V 50HZ", price: 1.25 },
    { code: "CCV12345-ABC", desc: "RESSORT DE RAPPEL", price: 0.05 },
    { code: "DDV67890-DEF", desc: "CONTACT MOBILE", price: 0.15 },
    { code: "EEV11223-GHI", desc: "SOCLE DISJONCTEUR", price: 0.85 }
];

const REASONS = ["dimension", "aspect", "fonction", "matière", "autre"];
const OPERATORS = ["Jean Dupont", "Marie Martin", "Pierre Bernard", "Sophie Petit", "Luc Dubois"];

// Fonction pour générer une date aléatoire
function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Fonction pour formater la date YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

const data = [];
const today = new Date();
const startDate = new Date();
startDate.setDate(today.getDate() - DAYS_BACK);

console.log(`Génération de ${NUM_ROWS} lignes de données sur les ${DAYS_BACK} derniers jours...`);

for (let i = 0; i < NUM_ROWS; i++) {
    const date = getRandomDate(startDate, today);
    const machine = MACHINES[Math.floor(Math.random() * MACHINES.length)];
    const material = MATERIALS[Math.floor(Math.random() * MATERIALS.length)];
    const operator = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];

    // 70% de chance d'avoir de la production, 30% de chance d'avoir du rebut
    // Parfois les deux

    let scrapQty = 0;
    let prodQty = 0;
    let reason = "";

    const rand = Math.random();

    if (rand < 0.6) {
        // Production normale (pas de rebut)
        prodQty = Math.floor(Math.random() * 5000) + 500;
    } else if (rand < 0.8) {
        // Rebut seulement (ex: tri)
        scrapQty = Math.floor(Math.random() * 200) + 10;
        reason = REASONS[Math.floor(Math.random() * REASONS.length)];
    } else {
        // Production ET Rebut
        prodQty = Math.floor(Math.random() * 5000) + 500;
        scrapQty = Math.floor(Math.random() * 100) + 5;
        reason = REASONS[Math.floor(Math.random() * REASONS.length)];
    }

    data.push({
        "Date": formatDate(date),
        "Machine": machine,
        "Matériel": material.code,
        "Description": material.desc,
        "Quantité": scrapQty > 0 ? scrapQty : "", // Qte Rebut
        "QTE PROD APP": prodQty > 0 ? prodQty : "", // Qte Production
        "Prix unitaire": material.price,
        "Coût total": (scrapQty * material.price).toFixed(2),
        "Raison": reason,
        "Opérateur": operator,
        "Centre": "" // Sera déduit par l'app
    });
}

// Trier par date
data.sort((a, b) => new Date(b.Date) - new Date(a.Date));

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);
xlsx.utils.book_append_sheet(wb, ws, "CONFIRMATION BRIDGE");

xlsx.writeFile(wb, FILE_PATH);
console.log(`Fichier Excel généré avec succès : ${FILE_PATH}`);
console.log(`Contient ${data.length} enregistrements.`);
