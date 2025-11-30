// Script pour visualiser les fiches étoiles dans MySQL
const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

async function viewFiches() {
    console.log('📊 Visualisation des Fiches Étoiles MySQL\n');
    console.log('========================================\n');

    try {
        // Connexion à MySQL
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            port: dbConfig.port
        });

        console.log('✅ Connecté à MySQL\n');

        // Compter les fiches
        const [countResult] = await connection.query('SELECT COUNT(*) as total FROM fiche_etoile');
        const total = countResult[0].total;

        console.log(`📝 Nombre total de fiches : ${total}\n`);

        if (total === 0) {
            console.log('ℹ️  Aucune fiche dans la base de données.');
            console.log('👉 Envoyez une fiche depuis http://localhost:3000/forms.html\n');
            await connection.end();
            return;
        }

        // Récupérer toutes les fiches
        const [fiches] = await connection.query('SELECT * FROM fiche_etoile ORDER BY created_at DESC');

        console.log('📋 Liste des Fiches Étoiles :\n');
        console.log('─'.repeat(120));

        fiches.forEach((fiche, index) => {
            console.log(`\n🔹 Fiche #${index + 1}`);
            console.log(`   ID           : ${fiche.id}`);
            console.log(`   Référence    : ${fiche.reference}`);
            console.log(`   Émetteur     : ${fiche.emetteur}`);
            console.log(`   Date Fab     : ${fiche.date_fabrication}`);
            console.log(`   Date         : ${fiche.date}`);
            console.log(`   Quantité     : ${fiche.quantite}`);
            console.log(`   Avis Qualité : ${fiche.avis_qualite || 'N/A'}`);
            console.log(`   Description  : ${fiche.description.substring(0, 60)}${fiche.description.length > 60 ? '...' : ''}`);
            console.log(`   Actions      : ${fiche.actions.substring(0, 60)}${fiche.actions.length > 60 ? '...' : ''}`);
            console.log(`   Délai        : ${fiche.delai}`);
            console.log(`   Créé le      : ${fiche.created_at}`);
            console.log('─'.repeat(120));
        });

        console.log(`\n✅ ${total} fiche(s) affichée(s)\n`);

        await connection.end();

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('\n💡 Vérifiez que :');
        console.error('   1. MySQL est démarré');
        console.error('   2. La configuration dans config/db.config.js est correcte');
        console.error('   3. La base de données existe (lancez : node server.js)\n');
    }
}

viewFiches();
