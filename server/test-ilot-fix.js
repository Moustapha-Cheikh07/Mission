const ilotCacheManager = require('./ilot-cache-manager');

console.log('🧪 Test de correction des caches îlots...\n');

ilotCacheManager.refreshIlotCaches().then(result => {
    if (result.success) {
        console.log('\n✅ Cache rafraîchi avec succès!');
        console.log('Détails:', result.results);

        // Lire le cache GRM pour vérifier
        const grmData = ilotCacheManager.readIlotCache('GRM');
        if (grmData.success) {
            console.log('\n📊 Données GRM:');
            console.log('  - Nombre d\'enregistrements:', grmData.count);
            console.log('  - Nombre de rebuts:', grmData.stats.summary.totalRejectQuantity);
            console.log('  - Taux de rebuts:', grmData.stats.summary.rejectRate + '%');
            console.log('  - Coût total:', grmData.stats.summary.totalRejectCost + '€');
        }
    } else {
        console.error('❌ Erreur:', result.error);
    }
    process.exit(0);
}).catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
});
