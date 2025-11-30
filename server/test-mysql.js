// Test MySQL Connection
const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config');

async function testConnection() {
    console.log('🔍 Test de connexion MySQL...\n');

    try {
        // Test 1: Connection to MySQL server
        console.log('1️⃣ Test de connexion au serveur MySQL...');
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port
        });
        console.log('✅ Connexion au serveur MySQL réussie!\n');

        // Test 2: Create database if not exists
        console.log('2️⃣ Création de la base de données...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log(`✅ Base de données '${dbConfig.database}' créée/vérifiée!\n`);

        // Test 3: Use database
        console.log('3️⃣ Sélection de la base de données...');
        await connection.query(`USE ${dbConfig.database}`);
        console.log('✅ Base de données sélectionnée!\n');

        // Test 4: Show tables
        console.log('4️⃣ Liste des tables existantes:');
        const [tables] = await connection.query('SHOW TABLES');
        if (tables.length > 0) {
            tables.forEach(table => {
                console.log(`   📋 ${Object.values(table)[0]}`);
            });
        } else {
            console.log('   ℹ️ Aucune table (elles seront créées au démarrage du serveur)');
        }
        console.log('');

        // Test 5: Database info
        console.log('5️⃣ Informations de configuration:');
        console.log(`   🖥️  Host: ${dbConfig.host}`);
        console.log(`   👤 User: ${dbConfig.user}`);
        console.log(`   📊 Database: ${dbConfig.database}`);
        console.log(`   🔌 Port: ${dbConfig.port}`);
        console.log('');

        await connection.end();

        console.log('✅ ✅ ✅ Tous les tests réussis! MySQL est prêt! ✅ ✅ ✅\n');
        console.log('👉 Vous pouvez maintenant démarrer le serveur avec: node server.js\n');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('\n📝 Vérifiez:');
        console.error('   1. MySQL est démarré');
        console.error('   2. Les identifiants dans config/db.config.js sont corrects');
        console.error('   3. L\'utilisateur a les droits nécessaires');
        console.error('\n💡 Pour plus d\'aide, consultez CONFIGURATION-MYSQL.md\n');
        process.exit(1);
    }
}

testConnection();
