const mysql = require('mysql2/promise');

async function testConnection(host, user, password) {
    console.log(`\nTesting connection to ${host}...`);
    try {
        const connection = await mysql.createConnection({
            host: host,
            user: user,
            password: password,
            connectTimeout: 5000 // 5 seconds timeout
        });
        console.log(`✅ Success! Connected to ${host}`);
        await connection.end();
        return true;
    } catch (error) {
        console.error(`❌ Failed to connect to ${host}:`, error.message);
        console.error(`   Code: ${error.code}`);
        return false;
    }
}

async function runTests() {
    const password = 'Medmouna';

    console.log('--- MySQL Connectivity Diagnostics ---');

    // Test 1: 127.0.0.1
    await testConnection('127.0.0.1', 'root', password);

    // Test 2: localhost
    await testConnection('localhost', 'root', password);

    // Test 3: ::1 (IPv6)
    await testConnection('::1', 'root', password);
}

runTests();
