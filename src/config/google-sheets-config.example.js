/**
 * Configuration Google Sheets - Pré-remplie pour votre spreadsheet
 *
 * INSTRUCTIONS :
 * 1. Obtenez votre clé API Google (voir CONFIGURATION_PERSONNALISEE.md)
 * 2. Remplacez 'VOTRE_CLE_API_ICI' par votre vraie clé API
 * 3. Vérifiez le nom de votre feuille Google Sheets (Sheet1 par défaut)
 * 4. Ouvrez index.html et la configuration se fera automatiquement
 *
 * ATTENTION : Ne commitez jamais ce fichier avec votre vraie clé API !
 */

const GoogleSheetsAutoConfig = {
    /**
     * ÉTAPE 1 : Remplacez par votre clé API Google
     * Format : AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
     */
    apiKey: 'VOTRE_CLE_API_ICI',

    /**
     * ÉTAPE 2 : ID de votre spreadsheet (déjà rempli)
     * URL complète : https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit
     */
    spreadsheetId: '1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo',

    /**
     * ÉTAPE 3 : Nom de votre feuille Google Sheets
     * Regardez en bas de votre Google Sheet pour voir le nom exact
     * Exemples : 'Sheet1', 'Feuille 1', 'Rebuts', 'Données'
     */
    sheetName: 'Sheet1',

    /**
     * Plage de colonnes (A à K = 11 colonnes)
     * Ajustez si vous avez plus ou moins de colonnes
     */
    columnRange: 'A:K',

    /**
     * Activer l'actualisation automatique au démarrage
     */
    autoRefreshOnStart: false,

    /**
     * Intervalle d'actualisation en millisecondes (30000 = 30 secondes)
     */
    refreshInterval: 30000,

    /**
     * Se connecter automatiquement au chargement de la page
     */
    autoConnectOnLoad: true,

    /**
     * Afficher les notifications de mise à jour
     */
    showNotifications: true,

    /**
     * Mode debug (affiche plus de logs dans la console)
     */
    debug: false
};

/**
 * Fonction d'auto-configuration
 * S'exécute automatiquement au chargement de la page
 */
(function() {
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoConfigureGoogleSheets);
    } else {
        autoConfigureGoogleSheets();
    }

    function autoConfigureGoogleSheets() {
        // Attendre que GoogleSheetsModule soit disponible
        const checkModule = setInterval(() => {
            if (typeof GoogleSheetsModule !== 'undefined') {
                clearInterval(checkModule);
                applyConfiguration();
            }
        }, 100);

        // Timeout après 10 secondes
        setTimeout(() => {
            clearInterval(checkModule);
        }, 10000);
    }

    function applyConfiguration() {
        try {
            console.log('[Auto-Config] Applying Google Sheets configuration...');

            // Vérifier si la clé API a été remplie
            if (GoogleSheetsAutoConfig.apiKey === 'VOTRE_CLE_API_ICI' || !GoogleSheetsAutoConfig.apiKey) {
                console.warn('[Auto-Config] ⚠️ Clé API non configurée. Veuillez modifier google-sheets-config.example.js');

                // Afficher un message à l'utilisateur
                if (GoogleSheetsAutoConfig.showNotifications && typeof GoogleSheetsModule.showMessage === 'function') {
                    GoogleSheetsModule.showMessage(
                        'Configuration Google Sheets incomplète. Consultez docs/CONFIGURATION_PERSONNALISEE.md',
                        'warning'
                    );
                }
                return;
            }

            // Construire la plage complète
            const range = `${GoogleSheetsAutoConfig.sheetName}!${GoogleSheetsAutoConfig.columnRange}`;

            // Appliquer la configuration
            GoogleSheetsModule.config.apiKey = GoogleSheetsAutoConfig.apiKey;
            GoogleSheetsModule.config.spreadsheetId = GoogleSheetsAutoConfig.spreadsheetId;
            GoogleSheetsModule.config.range = range;
            GoogleSheetsModule.config.refreshInterval = GoogleSheetsAutoConfig.refreshInterval;
            GoogleSheetsModule.config.autoRefresh = GoogleSheetsAutoConfig.autoRefreshOnStart;

            // Sauvegarder la configuration
            GoogleSheetsModule.saveConfiguration();

            console.log('[Auto-Config] ✅ Configuration appliquée :');
            console.log('[Auto-Config]   - Spreadsheet ID:', GoogleSheetsAutoConfig.spreadsheetId);
            console.log('[Auto-Config]   - Range:', range);
            console.log('[Auto-Config]   - Auto-refresh:', GoogleSheetsAutoConfig.autoRefreshOnStart);

            // Se connecter automatiquement si configuré
            if (GoogleSheetsAutoConfig.autoConnectOnLoad) {
                console.log('[Auto-Config] Connexion automatique...');
                setTimeout(() => {
                    GoogleSheetsModule.connect();
                }, 1000);
            }

            // Afficher une notification de succès
            if (GoogleSheetsAutoConfig.showNotifications && typeof GoogleSheetsModule.showMessage === 'function') {
                setTimeout(() => {
                    GoogleSheetsModule.showMessage(
                        'Configuration Google Sheets chargée automatiquement',
                        'success'
                    );
                }, 1500);
            }

        } catch (error) {
            console.error('[Auto-Config] ❌ Erreur lors de la configuration automatique:', error);

            if (GoogleSheetsAutoConfig.showNotifications && typeof GoogleSheetsModule.showMessage === 'function') {
                GoogleSheetsModule.showMessage(
                    'Erreur de configuration automatique : ' + error.message,
                    'error'
                );
            }
        }
    }

    // Logs de debug
    if (GoogleSheetsAutoConfig.debug) {
        console.log('[Auto-Config] Configuration chargée :', GoogleSheetsAutoConfig);
    }
})();

/**
 * Fonction utilitaire pour tester la configuration
 * Utilisez dans la console : testGoogleSheetsConfig()
 */
function testGoogleSheetsConfig() {
    console.log('=== Test de configuration Google Sheets ===');
    console.log('Clé API configurée :', GoogleSheetsAutoConfig.apiKey !== 'VOTRE_CLE_API_ICI' ? '✅ Oui' : '❌ Non');
    console.log('Spreadsheet ID :', GoogleSheetsAutoConfig.spreadsheetId);
    console.log('Plage :', `${GoogleSheetsAutoConfig.sheetName}!${GoogleSheetsAutoConfig.columnRange}`);
    console.log('Auto-connect :', GoogleSheetsAutoConfig.autoConnectOnLoad ? '✅ Activé' : '❌ Désactivé');
    console.log('Auto-refresh :', GoogleSheetsAutoConfig.autoRefreshOnStart ? '✅ Activé' : '❌ Désactivé');

    if (typeof GoogleSheetsModule !== 'undefined') {
        console.log('Module Google Sheets :', '✅ Chargé');
        console.log('Connecté :', GoogleSheetsModule.isConnected ? '✅ Oui' : '❌ Non');
        console.log('Données en cache :', GoogleSheetsModule.cachedData.length, 'rebuts');
    } else {
        console.log('Module Google Sheets :', '❌ Non chargé');
    }

    console.log('==========================================');
}
