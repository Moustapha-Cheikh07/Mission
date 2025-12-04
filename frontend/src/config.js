// Configuration Multi-Environnements
// Détection automatique: localhost (dev) vs serveur (production)

const Config = {
    // Détecter si on est en localhost ou sur le serveur
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',

    // URL de base de l'API selon l'environnement
    // Port 1880 uniquement (demande IT)
    get apiBaseURL() {
        if (this.isLocalhost) {
            // Développement sur localhost - port 1880
            return 'http://localhost:1880';
        } else {
            // Production sur le serveur
            return 'http://10.192.14.223:1880';
        }
    },

    // URLs complètes des API
    get apiData() {
        return `${this.apiBaseURL}/api/data`;
    },

    get apiDocumentsQuality() {
        return `${this.apiBaseURL}/api/documents/quality`;
    },

    get apiDocumentsTraining() {
        return `${this.apiBaseURL}/api/documents/training`;
    },

    get apiFichesEtoile() {
        return `${this.apiBaseURL}/api/fiches-etoile`;
    },

    get apiReferences() {
        return `${this.apiBaseURL}/api/references/850ms`;
    },

    // URL pour les îlots
    getApiIlot(ilotName) {
        return `${this.apiBaseURL}/api/ilot/${ilotName}`;
    },

    // Log de l'environnement détecté
    logEnvironment() {
        console.log('🌍 Configuration détectée:');
        console.log('   Environnement:', this.isLocalhost ? 'DÉVELOPPEMENT (localhost)' : 'PRODUCTION (serveur)');
        console.log('   API Base URL:', this.apiBaseURL);
    }
};

// Exposer Config globalement
window.Config = Config;

// Afficher l'environnement au chargement
Config.logEnvironment();
