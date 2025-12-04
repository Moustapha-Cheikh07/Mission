const fs = require('fs').promises;
const path = require('path');

// Chemins des fichiers JSON
const TRAINING_JSON = path.join(__dirname, 'training-documents.json');
const QUALITY_JSON = path.join(__dirname, 'quality-documents.json');

/**
 * Gestionnaire de documents sans MySQL
 * Utilise des fichiers JSON pour stocker les métadonnées
 */
const DocumentsManager = {
    /**
     * Lire un fichier JSON
     */
    async readJSON(filePath) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            // Si le fichier n'existe pas, retourner un tableau vide
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    },

    /**
     * Écrire dans un fichier JSON
     */
    async writeJSON(filePath, data) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    },

    /**
     * Générer un ID unique
     */
    generateId() {
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    // ========================================
    // TRAINING DOCUMENTS
    // ========================================

    /**
     * Obtenir tous les documents de formation
     */
    async getTrainingDocuments() {
        return await this.readJSON(TRAINING_JSON);
    },

    /**
     * Ajouter un document de formation
     */
    async addTrainingDocument(doc) {
        const documents = await this.readJSON(TRAINING_JSON);

        const newDoc = {
            id: this.generateId(),
            title: doc.title,
            category: doc.category,
            description: doc.description || '',
            filename: doc.filename,
            filepath: doc.filepath,
            uploaded_by: doc.uploaded_by || 'Admin',
            uploaded_at: new Date().toISOString()
        };

        documents.push(newDoc);
        await this.writeJSON(TRAINING_JSON, documents);

        return {
            success: true,
            id: newDoc.id,
            document: newDoc
        };
    },

    /**
     * Supprimer un document de formation
     */
    async deleteTrainingDocument(id) {
        const documents = await this.readJSON(TRAINING_JSON);
        const index = documents.findIndex(doc => doc.id === id);

        if (index === -1) {
            return { success: false, error: 'Document non trouvé' };
        }

        // Supprimer le fichier physique
        const doc = documents[index];
        const filePath = path.join(__dirname, '..', doc.filepath);

        try {
            await fs.unlink(filePath);
            console.log(`✅ Fichier supprimé: ${filePath}`);
        } catch (error) {
            console.warn(`⚠️ Impossible de supprimer le fichier: ${error.message}`);
        }

        // Supprimer des métadonnées
        documents.splice(index, 1);
        await this.writeJSON(TRAINING_JSON, documents);

        return { success: true, changes: 1 };
    },

    // ========================================
    // QUALITY DOCUMENTS
    // ========================================

    /**
     * Obtenir tous les documents qualité
     */
    async getQualityDocuments() {
        return await this.readJSON(QUALITY_JSON);
    },

    /**
     * Obtenir les documents qualité par machine
     */
    async getQualityDocumentsByMachine(machine) {
        const documents = await this.readJSON(QUALITY_JSON);
        return documents.filter(doc => doc.machine === machine);
    },

    /**
     * Ajouter un document qualité
     */
    async addQualityDocument(doc) {
        const documents = await this.readJSON(QUALITY_JSON);

        const newDoc = {
            id: this.generateId(),
            title: doc.title,
            category: doc.category,
            machine: doc.machine,
            description: doc.description || '',
            filename: doc.filename,
            filepath: doc.filepath,
            uploaded_by: doc.uploaded_by || 'Admin',
            uploaded_at: new Date().toISOString()
        };

        documents.push(newDoc);
        await this.writeJSON(QUALITY_JSON, documents);

        return {
            success: true,
            id: newDoc.id,
            document: newDoc
        };
    },

    /**
     * Supprimer un document qualité
     */
    async deleteQualityDocument(id) {
        const documents = await this.readJSON(QUALITY_JSON);
        const index = documents.findIndex(doc => doc.id === id);

        if (index === -1) {
            return { success: false, error: 'Document non trouvé' };
        }

        // Supprimer le fichier physique
        const doc = documents[index];
        const filePath = path.join(__dirname, '..', doc.filepath);

        try {
            await fs.unlink(filePath);
            console.log(`✅ Fichier supprimé: ${filePath}`);
        } catch (error) {
            console.warn(`⚠️ Impossible de supprimer le fichier: ${error.message}`);
        }

        // Supprimer des métadonnées
        documents.splice(index, 1);
        await this.writeJSON(QUALITY_JSON, documents);

        return { success: true, changes: 1 };
    }
};

module.exports = DocumentsManager;
