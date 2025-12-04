const fs = require('fs').promises;
const path = require('path');
const documentsManager = require('./documents-manager');

// Chemin du fichier CSV des fiches étoile
const FICHES_CSV_PATH = path.join(__dirname, 'fiches-etoile.csv');

/**
 * Gestionnaire de base de données sans MySQL
 * Utilise CSV pour les fiches étoile et JSON pour les documents
 */
const DatabaseManager = {
    // Promise résolue une fois l'initialisation terminée
    ready: Promise.resolve(),

    /**
     * Parser une ligne CSV
     */
    parseCSVLine(line) {
        return line.split(';');
    },

    /**
     * Lire toutes les fiches étoile depuis le CSV
     */
    async readFichesFromCSV() {
        try {
            const data = await fs.readFile(FICHES_CSV_PATH, 'utf8');
            const lines = data.trim().split('\n');

            // Ignorer la ligne d'en-tête
            if (lines.length <= 1) {
                return [];
            }

            const fiches = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const fields = this.parseCSVLine(line);
                if (fields.length >= 12) {
                    fiches.push({
                        id: i, // Utiliser le numéro de ligne comme ID
                        numero_nncp: fields[0],
                        date_creation: fields[1],
                        reference: fields[2],
                        libelle: fields[3],
                        quantite: parseFloat(fields[4]) || 0,
                        prix_unitaire: parseFloat(fields[5]) || 0,
                        prix_total: parseFloat(fields[6]) || 0,
                        date_production: fields[7],
                        operateur: fields[8],
                        probleme: fields[9],
                        decision_49ms: fields[10] === 'OUI',
                        status: fields[11]
                    });
                }
            }

            return fiches;
        } catch (error) {
            console.error('Erreur lors de la lecture du CSV:', error);
            if (error.code === 'ENOENT') {
                // Créer le fichier avec l'en-tête si il n'existe pas
                const header = 'Numero_NNCP;Date_Creation;Reference;Libelle;Quantite;Prix_Unitaire;Prix_Total;Date_Production;Operateur;Probleme;Decision_49MS;Status\n';
                await fs.writeFile(FICHES_CSV_PATH, header, 'utf8');
                return [];
            }
            throw error;
        }
    },

    /**
     * Écrire toutes les fiches étoile dans le CSV
     */
    async writeFichesToCSV(fiches) {
        const header = 'Numero_NNCP;Date_Creation;Reference;Libelle;Quantite;Prix_Unitaire;Prix_Total;Date_Production;Operateur;Probleme;Decision_49MS;Status\n';
        const lines = fiches.map(fiche => {
            const decision = fiche.decision_49ms ? 'OUI' : 'NON';
            return `${fiche.numero_nncp};${fiche.date_creation};${fiche.reference};${fiche.libelle};${fiche.quantite};${fiche.prix_unitaire};${fiche.prix_total};${fiche.date_production};${fiche.operateur};${fiche.probleme};${decision};${fiche.status}`;
        });

        await fs.writeFile(FICHES_CSV_PATH, header + lines.join('\n') + '\n', 'utf8');
    },

    /**
     * Générer le prochain numéro NNCP
     */
    async generateNumeroNNCP() {
        const fiches = await this.readFichesFromCSV();
        const year = new Date().getFullYear();

        // Trouver le dernier numéro pour l'année en cours
        const currentYearFiches = fiches.filter(f =>
            f.numero_nncp.startsWith(`NNCP-${year}-`)
        );

        if (currentYearFiches.length === 0) {
            return `NNCP-${year}-001`;
        }

        // Extraire les numéros et trouver le maximum
        const numbers = currentYearFiches.map(f => {
            const match = f.numero_nncp.match(/NNCP-\d{4}-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
        });

        const maxNumber = Math.max(...numbers);
        const nextNumber = (maxNumber + 1).toString().padStart(3, '0');

        return `NNCP-${year}-${nextNumber}`;
    },

    // ========================================
    // FICHES ÉTOILE
    // ========================================

    /**
     * Obtenir toutes les fiches étoile
     */
    async getFichesEtoile() {
        return await this.readFichesFromCSV();
    },

    /**
     * Obtenir une fiche étoile par ID
     */
    async getFicheEtoileById(id) {
        const fiches = await this.readFichesFromCSV();
        return fiches.find(f => f.id === parseInt(id));
    },

    /**
     * Obtenir les fiches étoile par statut
     */
    async getFichesEtoileByStatus(status) {
        const fiches = await this.readFichesFromCSV();
        return fiches.filter(f => f.status === status);
    },

    /**
     * Rechercher des fiches étoile
     */
    async searchFichesEtoile(term) {
        const fiches = await this.readFichesFromCSV();
        const searchTerm = term.toLowerCase();

        return fiches.filter(f =>
            f.numero_nncp.toLowerCase().includes(searchTerm) ||
            f.reference.toLowerCase().includes(searchTerm) ||
            f.libelle.toLowerCase().includes(searchTerm) ||
            f.operateur.toLowerCase().includes(searchTerm) ||
            f.probleme.toLowerCase().includes(searchTerm)
        );
    },

    /**
     * Ajouter une fiche étoile
     */
    async addFicheEtoile(fiche) {
        const fiches = await this.readFichesFromCSV();

        const prix_total = (fiche.quantite || 0) * (fiche.prix_unitaire || 0);

        const newFiche = {
            id: fiches.length > 0 ? Math.max(...fiches.map(f => f.id)) + 1 : 1,
            numero_nncp: fiche.numero_nncp,
            date_creation: new Date().toISOString().split('T')[0],
            reference: fiche.reference,
            libelle: fiche.libelle,
            quantite: fiche.quantite || 0,
            prix_unitaire: fiche.prix_unitaire || 0,
            prix_total: prix_total,
            date_production: fiche.date_production,
            operateur: fiche.operateur || 'Non spécifié',
            probleme: fiche.probleme || 'Non spécifié',
            decision_49ms: fiche.decision_49ms || false,
            status: fiche.status || 'pending'
        };

        fiches.push(newFiche);
        await this.writeFichesToCSV(fiches);

        return { lastID: newFiche.id };
    },

    /**
     * Mettre à jour une fiche étoile
     */
    async updateFicheEtoile(id, updates) {
        const fiches = await this.readFichesFromCSV();
        const index = fiches.findIndex(f => f.id === parseInt(id));

        if (index === -1) {
            return { changes: 0 };
        }

        // Mettre à jour les champs fournis
        const fiche = fiches[index];
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                fiche[key] = updates[key];
            }
        });

        // Recalculer le prix total si nécessaire
        if (updates.quantite !== undefined || updates.prix_unitaire !== undefined) {
            fiche.prix_total = fiche.quantite * fiche.prix_unitaire;
        }

        await this.writeFichesToCSV(fiches);
        return { changes: 1 };
    },

    /**
     * Supprimer une fiche étoile
     */
    async deleteFicheEtoile(id) {
        const fiches = await this.readFichesFromCSV();
        const filteredFiches = fiches.filter(f => f.id !== parseInt(id));

        if (filteredFiches.length === fiches.length) {
            return { changes: 0 };
        }

        await this.writeFichesToCSV(filteredFiches);
        return { changes: 1 };
    },

    // ========================================
    // QUALITY DOCUMENTS (déléguer à documents-manager)
    // ========================================

    async getQualityDocuments() {
        return await documentsManager.getQualityDocuments();
    },

    async getQualityDocumentsByMachine(machine) {
        return await documentsManager.getQualityDocumentsByMachine(machine);
    },

    async addQualityDocument(doc) {
        const result = await documentsManager.addQualityDocument(doc);
        return { lastID: result.id };
    },

    async deleteQualityDocument(id) {
        return await documentsManager.deleteQualityDocument(id);
    },

    // ========================================
    // TRAINING DOCUMENTS (déléguer à documents-manager)
    // ========================================

    async getTrainingDocuments() {
        return await documentsManager.getTrainingDocuments();
    },

    async addTrainingDocument(doc) {
        const result = await documentsManager.addTrainingDocument(doc);
        return { lastID: result.id };
    },

    async deleteTrainingDocument(id) {
        return await documentsManager.deleteTrainingDocument(id);
    },

    // ========================================
    // SHUTDOWN
    // ========================================

    close() {
        console.log('✅ Database manager closed');
    }
};

module.exports = DatabaseManager;
