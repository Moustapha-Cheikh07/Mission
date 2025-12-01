const fs = require('fs');
const path = require('path');

// Configuration pour chaque îlot
const ilots = [
    {
        name: 'BZ1',
        color: '#f093fb 0%, #f5576c 100%', // Rouge/Rose
        file: 'bz1.html'
    },
    {
        name: 'BZ2',
        color: '#fa709a 0%, #fee140 100%', // Rose/Jaune
        file: 'bz2.html'
    },
    {
        name: 'GRM',
        color: '#30cfd0 0%, #330867 100%', // Cyan/Violet foncé
        file: 'grm.html'
    }
];

ilots.forEach(ilot => {
    const filePath = path.join(__dirname, ilot.file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remplacer PM1 par le nom de l'îlot
    content = content.replace(/PM1/g, ilot.name);

    // Remplacer la couleur du header
    content = content.replace(
        /background: linear-gradient\(135deg, #3C8CE7 0%, #00EAFF 100%\)/,
        `background: linear-gradient(135deg, ${ilot.color})`
    );

    // Sauvegarder
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${ilot.name} personnalisé avec succès`);
});

console.log('\n✅ Toutes les pages îlots ont été personnalisées !');
