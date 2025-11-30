const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

async function testConnection() {
    console.log('🔍 Test de connexion MySQL\n');
    console.log('Configuration:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   User: ${dbConfig.user}`);
    console.log(`   Password: ${dbConfig.password ? '***' : '(vide)'}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   Port: ${dbConfig.port}\n`);

    try {
        console.log('Tentative de connexion...');
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });

        console.log('✅ Connexion MySQL réussie!\n');

        // Vérifier si la base de données existe
        const [databases] = await connection.query('SHOW DATABASES');
        const dbExists = databases.some(db => Object.values(db)[0] === dbConfig.database);

        if (dbExists) {
            console.log(`✅ La base de données '${dbConfig.database}' existe`);

            // Se connecter à la base de données
            await connection.query(`USE ${dbConfig.database}`);

            // Vérifier les tables
            const [tables] = await connection.query('SHOW TABLES');
            console.log(`\n📊 Tables trouvées (${tables.length}):`);
            tables.forEach(table => {
                console.log(`   - ${Object.values(table)[0]}`);
            });

            // Vérifier spécifiquement la table fiche_etoile
            const ficheTable = tables.find(t => Object.values(t)[0] === 'fiche_etoile');
            if (ficheTable) {
                console.log(`\n✅ La table 'fiche_etoile' existe`);

                // Compter les fiches
                const [count] = await connection.query('SELECT COUNT(*) as total FROM fiche_etoile');
                console.log(`   Nombre de fiches: ${count[0].total}`);
            } else {
                console.log(`\n⚠️  La table 'fiche_etoile' n'existe pas encore`);
                console.log('   Lancez le serveur (node server.js) pour créer les tables automatiquement');
                console.log('   Ou exécutez: mysql -u root -p merlin_gerin_dashboard < init-database.sql');
            }
        } else {
            console.log(`\n⚠️  La base de données '${dbConfig.database}' n'existe pas`);
            console.log('\n💡 Pour créer la base de données, exécutez:');
            console.log(`   mysql -u root -p`);
            console.log(`   CREATE DATABASE ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
            console.log(`   USE ${dbConfig.database};`);
            console.log(`   SOURCE init-database.sql;`);
            console.log(`   EXIT;`);
            console.log('\nOu lancez simplement le serveur (node server.js) qui créera la base automatiquement');
        }

        await connection.end();
        console.log('\n✅ Tout est OK! Vous pouvez démarrer le serveur.\n');

    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        console.log('\n💡 Vérifiez:');
        console.log('   1. MySQL est-il démarré? (net start MySQL80)');
        console.log('   2. Les credentials dans config/db.config.js sont-ils corrects?');
        console.log('   3. Le port MySQL est-il bien 3306?');

        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n🔑 Erreur d\'authentification:');
            console.log('   - Vérifiez le mot de passe dans config/db.config.js');
            console.log('   - Si MySQL n\'a pas de mot de passe, laissez password: \'\'');
            console.log('   - Si MySQL a un mot de passe, définissez-le dans password: \'votre_mot_de_passe\'');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n🔌 MySQL n\'est pas accessible:');
            console.log('   - Vérifiez que MySQL est démarré');
            console.log('   - Vérifiez que le port 3306 est correct');
        }
        console.log('');
    }
}

testConnection();
