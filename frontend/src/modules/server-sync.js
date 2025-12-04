// Server Sync Module - Synchronize documents and forms with server database
const ServerSync = {
    baseURL: window.Config ? window.Config.apiBaseURL : 'http://10.192.14.223:1880',

    // ====================================
    // QUALITY DOCUMENTS
    // ====================================

    async getQualityDocuments() {
        try {
            const response = await fetch(`${this.baseURL}/api/documents/quality`);
            const result = await response.json();

            if (result.success) {
                return result.data || [];
            } else {
                console.error('Error fetching quality documents:', result.error);
                return [];
            }
        } catch (error) {
            console.error('Error fetching quality documents:', error);
            // Fallback to localStorage if server is not available
            return DataManager.getDocuments();
        }
    },

    async getQualityDocumentsByMachine(machine) {
        try {
            const response = await fetch(`${this.baseURL}/api/documents/quality/${machine}`);
            const result = await response.json();

            if (result.success) {
                return result.data || [];
            } else {
                console.error('Error fetching quality documents:', result.error);
                return [];
            }
        } catch (error) {
            console.error('Error fetching quality documents:', error);
            return [];
        }
    },

    async addQualityDocument(formData) {
        try {
            const response = await fetch(`${this.baseURL}/api/documents/quality`, {
                method: 'POST',
                body: formData // FormData avec fichier
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Document qualité ajouté avec succès');
                return true;
            } else {
                console.error('Error adding quality document:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error adding quality document:', error);
            return false;
        }
    },

    async deleteQualityDocument(id) {
        try {
            const response = await fetch(`${this.baseURL}/api/documents/quality/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error deleting quality document:', error);
            return false;
        }
    },

    // ====================================
    // TRAINING DOCUMENTS
    // ====================================

    async getTrainingDocuments() {
        try {
            const response = await fetch(`${this.baseURL}/api/documents/training`);
            const result = await response.json();

            if (result.success) {
                return result.data || [];
            } else {
                console.error('Error fetching training documents:', result.error);
                return [];
            }
        } catch (error) {
            console.error('Error fetching training documents:', error);
            // Fallback to localStorage if server is not available
            return DataManager.getTrainingDocuments();
        }
    },

    async addTrainingDocument(formData) {
        try {
            const response = await fetch(`${this.baseURL}/api/documents/training`, {
                method: 'POST',
                body: formData // FormData avec fichier
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Document de formation ajouté avec succès');
                return true;
            } else {
                console.error('Error adding training document:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error adding training document:', error);
            return false;
        }
    },

    async deleteTrainingDocument(id) {
        try {
            const response = await fetch(`${this.baseURL}/api/documents/training/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error deleting training document:', error);
            return false;
        }
    },

    // ====================================
    // FICHE ETOILE (FORMS)
    // ====================================

    async getFichesEtoile() {
        try {
            const response = await fetch(`${this.baseURL}/api/fiches-etoile`);
            const result = await response.json();

            if (result.success) {
                return result.data || [];
            } else {
                console.error('Error fetching fiches etoile:', result.error);
                return [];
            }
        } catch (error) {
            console.error('Error fetching fiches etoile:', error);
            return [];
        }
    },

    async addFicheEtoile(ficheData) {
        try {
            const response = await fetch(`${this.baseURL}/api/fiches-etoile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ficheData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Fiche étoile ajoutée avec succès');
                return true;
            } else {
                console.error('Error adding fiche etoile:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error adding fiche etoile:', error);
            return false;
        }
    },

    async deleteFicheEtoile(id) {
        try {
            const response = await fetch(`${this.baseURL}/api/fiches-etoile/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('Error deleting fiche etoile:', error);
            return false;
        }
    }
};

// Expose globally
window.ServerSync = ServerSync;
