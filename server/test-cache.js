/**
 * Script de test pour le système de cache
 * Exécutez ce script avec : node test-cache.js
 */

const cacheManager = require('./cache-manager');

async function testCacheSystem() {
    console.log('\n========================================');
    console.log('🧪 TEST DU SYSTÈME DE CACHE');
    console.log('========================================\n');

    // Test 1: Rafraîchir le cache
    console.log('📝 Test 1: Rafraîchissement du cache...');
    const refreshResult = await cacheManager.refreshCache();

    if (refreshResult.success) {
        console.log('✅ Test 1 RÉUSSI\n');
    } else {
        console.log('❌ Test 1 ÉCHEC:', refreshResult.error, '\n');
        return;
    }

    // Test 2: Lire le cache
    console.log('📝 Test 2: Lecture du cache...');
    const startTime = Date.now();
    const cacheData = cacheManager.readCache();
    const readDuration = Date.now() - startTime;

    if (cacheData.success) {
        console.log(`✅ Test 2 RÉUSSI`);
        console.log(`   • Durée de lecture : ${readDuration}ms`);
        console.log(`   • Nombre d'enregistrements : ${cacheData.count}`);
        console.log(`   • Total lignes Excel : ${cacheData.totalRows}\n`);
    } else {
        console.log('❌ Test 2 ÉCHEC:', cacheData.error, '\n');
        return;
    }

    // Test 3: Info sur le cache
    console.log('📝 Test 3: Informations du cache...');
    const cacheInfo = cacheManager.getCacheInfo();

    if (cacheInfo.exists) {
        console.log('✅ Test 3 RÉUSSI');
        console.log('   • Chemin :', cacheInfo.path);
        console.log('   • Taille :', cacheInfo.size);
        console.log('   • Créé le :', new Date(cacheInfo.cacheCreatedAt).toLocaleString('fr-FR'));
        console.log('   • Modifié le :', new Date(cacheInfo.lastModified).toLocaleString('fr-FR'));
    } else {
        console.log('❌ Test 3 ÉCHEC:', cacheInfo.error || 'Cache non trouvé');
    }

    console.log('\n========================================');
    console.log('🎉 TOUS LES TESTS SONT TERMINÉS');
    console.log('========================================\n');

    // Comparaison des performances
    console.log('📊 GAIN DE PERFORMANCE :');
    console.log(`   • Lecture Excel (estimé) : ~55000ms`);
    console.log(`   • Lecture JSON (mesuré)  : ${readDuration}ms`);
    console.log(`   • Gain de vitesse        : ~${Math.round(55000 / readDuration)}x plus rapide\n`);
}

// Exécuter le test
testCacheSystem().catch(error => {
    console.error('\n❌ ERREUR LORS DU TEST:', error);
    process.exit(1);
});
