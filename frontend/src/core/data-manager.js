// Data Manager - Manages all application data
const DataManager = {
    // Storage keys
    STORAGE_KEYS: {
        RESULTS: 'mg_quality_results',
        DOCUMENTS: 'mg_quality_documents',
        REJECTS: 'mg_quality_rejects',
        ACTIVITIES: 'mg_recent_activities',
        QUALITY_CHECKS: 'mg_quality_checks',
        TRAINING_DOCS: 'mg_training_documents',
        VERSION: 'mg_data_version'
    },

    DATA_VERSION: '3.4', // Increment this to force data refresh

    // Check if localStorage is available
    isLocalStorageAvailable: function() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.error('localStorage is not available:', e);
            return false;
        }
    },

    // Safe localStorage getter
    getItem: function(key) {
        try {
            if (!this.isLocalStorageAvailable()) {
                return null;
            }
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    // Safe localStorage setter
    setItem: function(key, value) {
        try {
            if (!this.isLocalStorageAvailable()) {
                console.error('localStorage not available');
                return false;
            }
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded');
                alert('Espace de stockage insuffisant. Veuillez vider le cache de votre navigateur.');
            } else {
                console.error('Error writing to localStorage:', e);
            }
            return false;
        }
    },

    // Initialize data manager
    init: function() {
        try {
            const currentVersion = this.getItem(this.STORAGE_KEYS.VERSION);

            // Load data from localStorage or use sample data
            // Also refresh data if version changed
            if (!this.getItem(this.STORAGE_KEYS.RESULTS) || currentVersion !== this.DATA_VERSION) {
                this.initializeSampleData();
                this.setItem(this.STORAGE_KEYS.VERSION, this.DATA_VERSION);
            }
        } catch (e) {
            console.error('Error initializing DataManager:', e);
            this.initializeSampleData();
        }
    },

    // Initialize with sample data
    initializeSampleData: function() {
        // Generate dates relative to today
        const today = new Date();
        const formatDate = (daysAgo) => {
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);
            return date.toISOString().split('T')[0];
        };

        const sampleResults = [
            { date: formatDate(0), line: 'A', reference: 'MG-2025-001', status: 'success', operator: 'Jean Dupont' },
            { date: formatDate(0), line: 'B', reference: 'MG-2025-002', status: 'success', operator: 'Marie Martin' },
            { date: formatDate(1), line: 'C', reference: 'MG-2025-003', status: 'warning', operator: 'Pierre Bernard' },
            { date: formatDate(1), line: 'A', reference: 'MG-2025-004', status: 'success', operator: 'Sophie Petit' },
            { date: formatDate(2), line: 'D', reference: 'MG-2025-005', status: 'danger', operator: 'Luc Dubois' },
            { date: formatDate(2), line: 'B', reference: 'MG-2025-006', status: 'success', operator: 'Anne Moreau' },
            { date: formatDate(3), line: 'C', reference: 'MG-2025-007', status: 'success', operator: 'Thomas Laurent' },
            { date: formatDate(3), line: 'A', reference: 'MG-2025-008', status: 'warning', operator: 'Julie Simon' },
            { date: formatDate(4), line: 'B', reference: 'MG-2025-009', status: 'success', operator: 'Marc Michel' },
            { date: formatDate(5), line: 'D', reference: 'MG-2025-010', status: 'success', operator: 'Claire Lefevre' },
            { date: formatDate(6), line: 'A', reference: 'MG-2025-011', status: 'danger', operator: 'Paul Leroy' },
            { date: formatDate(7), line: 'C', reference: 'MG-2025-012', status: 'success', operator: 'Emma Roux' }
        ];

        // Quality documents now start empty - admins will upload them
        const sampleDocuments = [];

        // Sample rejects with ALL MS machines (20 machines)
        const sampleRejects = [
            // 850MS070
            {
                date: formatDate(0),
                machine: '850MS070',
                workcenter: '850MS070',
                material: 'MAT070-001',
                description: 'COMPONENT 850MS070',
                scrapQuantity: 100,
                unitPrice: 0.02864,
                totalCost: 2.86,
                reason: 'dimension',
                operator: 'Jean Dupont'
            },
            // 850MS073
            {
                date: formatDate(1),
                machine: '850MS073',
                workcenter: '850MS073',
                material: 'MAT073-001',
                description: 'COMPONENT 850MS073',
                scrapQuantity: 150,
                unitPrice: 0.01433,
                totalCost: 2.15,
                reason: 'appearance',
                operator: 'Marie Martin'
            },
            // 850MS085
            {
                date: formatDate(0),
                machine: '850MS085',
                workcenter: '850MS085',
                material: '04294964BE-EMB',
                description: 'MAGNETIC CONTACT FRAME',
                scrapQuantity: 589,
                unitPrice: 0.01267,
                totalCost: 7.46,
                reason: 'dimension',
                operator: 'Pierre Bernard'
            },
            // 850MS086
            {
                date: formatDate(2),
                machine: '850MS086',
                workcenter: '850MS086',
                material: 'MAT086-001',
                description: 'COMPONENT 850MS086',
                scrapQuantity: 200,
                unitPrice: 0.01270,
                totalCost: 2.54,
                reason: 'material',
                operator: 'Sophie Petit'
            },
            // 850MS087
            {
                date: formatDate(1),
                machine: '850MS087',
                workcenter: '850MS087',
                material: 'MAT087-001',
                description: 'COMPONENT 850MS087',
                scrapQuantity: 180,
                unitPrice: 0.05199,
                totalCost: 9.36,
                reason: 'function',
                operator: 'Luc Dubois'
            },
            // 850MS091
            {
                date: formatDate(0),
                machine: '850MS091',
                workcenter: '850MS091',
                material: 'MAT091-001',
                description: 'COMPONENT 850MS091',
                scrapQuantity: 120,
                unitPrice: 0.05789,
                totalCost: 6.95,
                reason: 'appearance',
                operator: 'Anne Moreau'
            },
            // 850MS104
            {
                date: formatDate(2),
                machine: '850MS104',
                workcenter: '850MS104',
                material: 'MAT104-001',
                description: 'COMPONENT 850MS104',
                scrapQuantity: 160,
                unitPrice: 0.02061,
                totalCost: 3.30,
                reason: 'dimension',
                operator: 'Thomas Laurent'
            },
            // 850MS117
            {
                date: formatDate(1),
                machine: '850MS117',
                workcenter: '850MS117',
                material: 'MAT117-001',
                description: 'COMPONENT 850MS117',
                scrapQuantity: 210,
                unitPrice: 0.00790,
                totalCost: 1.66,
                reason: 'material',
                operator: 'Julie Simon'
            },
            // 850MS120
            {
                date: formatDate(0),
                machine: '850MS120',
                workcenter: '850MS120',
                material: '04290013AC-EMB',
                description: 'MAGNETIC CONTACT FRAME 25A',
                scrapQuantity: 300,
                unitPrice: 0.01788,
                totalCost: 5.36,
                reason: 'dimension',
                operator: 'Marc Michel'
            },
            // 850MS122
            {
                date: formatDate(1),
                machine: '850MS122',
                workcenter: '850MS122',
                material: 'GHC15229-EMB',
                description: '63A MULTIPOLAR THERMAL SUB-ASSEMBLY',
                scrapQuantity: 3000,
                unitPrice: 0.02477,
                totalCost: 74.31,
                reason: 'material',
                operator: 'Claire Lefevre'
            },
            // 850MS123
            {
                date: formatDate(2),
                machine: '850MS123',
                workcenter: '850MS123',
                material: 'AAV83736-OTS',
                description: '20A MULTIPOLAR THERMAL SUB-ASSEMBLY',
                scrapQuantity: 150,
                unitPrice: 0.03043,
                totalCost: 4.56,
                reason: 'function',
                operator: 'Paul Leroy'
            },
            // 850MS125
            {
                date: formatDate(0),
                machine: '850MS125',
                workcenter: '850MS125',
                material: 'MAT125-001',
                description: 'COMPONENT 850MS125',
                scrapQuantity: 250,
                unitPrice: 0.02482,
                totalCost: 6.21,
                reason: 'appearance',
                operator: 'Emma Roux'
            },
            // 850MS130
            {
                date: formatDate(1),
                machine: '850MS130',
                workcenter: '850MS130',
                material: 'MAT130-001',
                description: 'COMPONENT 850MS130',
                scrapQuantity: 140,
                unitPrice: 0.02473,
                totalCost: 3.46,
                reason: 'dimension',
                operator: 'Jean Dupont'
            },
            // 850MS135
            {
                date: formatDate(0),
                machine: '850MS135',
                workcenter: '850MS135',
                material: 'BBV50831-EMB',
                description: '16A MULTIPOLAR MECANO THERMAL S/A IC60',
                scrapQuantity: 275,
                unitPrice: 0.04899,
                totalCost: 13.47,
                reason: 'function',
                operator: 'Marie Martin'
            },
            // 850MS143
            {
                date: formatDate(2),
                machine: '850MS143',
                workcenter: '850MS143',
                material: 'MAT143-001',
                description: 'COMPONENT 850MS143',
                scrapQuantity: 190,
                unitPrice: 0.08640,
                totalCost: 16.42,
                reason: 'material',
                operator: 'Pierre Bernard'
            },
            // 850MS144
            {
                date: formatDate(1),
                machine: '850MS144',
                workcenter: '850MS144',
                material: 'MAT144-001',
                description: 'COMPONENT 850MS144',
                scrapQuantity: 220,
                unitPrice: 0.02582,
                totalCost: 5.68,
                reason: 'appearance',
                operator: 'Sophie Petit'
            },
            // 850MS146
            {
                date: formatDate(0),
                machine: '850MS146',
                workcenter: '850MS146',
                material: 'MAT146-001',
                description: 'COMPONENT 850MS146',
                scrapQuantity: 180,
                unitPrice: 0.02398,
                totalCost: 4.32,
                reason: 'dimension',
                operator: 'Luc Dubois'
            },
            // 850MS150
            {
                date: formatDate(2),
                machine: '850MS150',
                workcenter: '850MS150',
                material: 'ABC12345',
                description: 'COMPONENT TEST',
                scrapQuantity: 200,
                unitPrice: 0.02864,
                totalCost: 5.73,
                reason: 'material',
                operator: 'Anne Moreau'
            },
            // 850MS157
            {
                date: formatDate(1),
                machine: '850MS157',
                workcenter: '850MS157',
                material: 'MAT157-001',
                description: 'COMPONENT 850MS157',
                scrapQuantity: 170,
                unitPrice: 0.01681,
                totalCost: 2.86,
                reason: 'function',
                operator: 'Thomas Laurent'
            },
            // 850MS158
            {
                date: formatDate(0),
                machine: '850MS158',
                workcenter: '850MS158',
                material: 'HRB73524',
                description: 'THERMAL S/A GRECO 16A (G16)',
                scrapQuantity: 110,
                unitPrice: 0.01377,
                totalCost: 1.51,
                reason: 'appearance',
                operator: 'Julie Simon'
            },
            // 850MS071
            {
                date: formatDate(1),
                machine: '850MS071',
                workcenter: '850MS071',
                material: 'MAT071-001',
                description: 'COMPONENT 850MS071',
                scrapQuantity: 130,
                unitPrice: 0.02100,
                totalCost: 2.73,
                reason: 'dimension',
                operator: 'Marc Michel'
            },
            // 850MS077
            {
                date: formatDate(2),
                machine: '850MS077',
                workcenter: '850MS077',
                material: 'MAT077-001',
                description: 'COMPONENT 850MS077',
                scrapQuantity: 170,
                unitPrice: 0.01850,
                totalCost: 3.15,
                reason: 'material',
                operator: 'Claire Lefevre'
            },
            // 850MS155
            {
                date: formatDate(0),
                machine: '850MS155',
                workcenter: '850MS155',
                material: 'MAT155-001',
                description: 'COMPONENT 850MS155',
                scrapQuantity: 160,
                unitPrice: 0.02200,
                totalCost: 3.52,
                reason: 'function',
                operator: 'Paul Leroy'
            },
            // 850MS161
            {
                date: formatDate(1),
                machine: '850MS161',
                workcenter: '850MS161',
                material: 'MAT161-001',
                description: 'COMPONENT 850MS161',
                scrapQuantity: 140,
                unitPrice: 0.01950,
                totalCost: 2.73,
                reason: 'appearance',
                operator: 'Emma Roux'
            }
        ];

        const sampleActivities = [
            {
                id: 1,
                type: 'quality_check',
                title: 'Contrôle qualité terminé',
                description: 'Ligne de production A',
                timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                icon: 'check',
                user: 'Jean Dupont'
            },
            {
                id: 2,
                type: 'document',
                title: 'Nouveau dossier créé',
                description: 'Dossier #QC-2025-089',
                timestamp: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
                icon: 'file',
                user: 'Marie Martin'
            },
            {
                id: 3,
                type: 'training',
                title: 'Formation complétée',
                description: 'Concepts qualité de base',
                timestamp: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                icon: 'user-graduate',
                user: 'Pierre Bernard'
            }
        ];

        const sampleQualityChecks = [];

        this.setItem(this.STORAGE_KEYS.RESULTS, JSON.stringify(sampleResults));
        this.setItem(this.STORAGE_KEYS.DOCUMENTS, JSON.stringify(sampleDocuments));
        this.setItem(this.STORAGE_KEYS.REJECTS, JSON.stringify(sampleRejects));
        this.setItem(this.STORAGE_KEYS.ACTIVITIES, JSON.stringify(sampleActivities));
        this.setItem(this.STORAGE_KEYS.QUALITY_CHECKS, JSON.stringify(sampleQualityChecks));
    },

    // Get results
    getResults: function() {
        try {
            const data = this.getItem(this.STORAGE_KEYS.RESULTS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error parsing results data:', e);
            return [];
        }
    },

    // Get documents - FROM DATABASE ONLY
    getDocuments: async function() {
        if (window.ServerSync) {
            return await ServerSync.getQualityDocuments();
        }
        console.error('ServerSync not available');
        return [];
    },

    // Get rejects
    getRejects: function() {
        try {
            const data = this.getItem(this.STORAGE_KEYS.REJECTS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error parsing rejects data:', e);
            return [];
        }
    },

    // Add result
    addResult: function(result) {
        try {
            const results = this.getResults();
            results.unshift(result);
            return this.setItem(this.STORAGE_KEYS.RESULTS, JSON.stringify(results));
        } catch (e) {
            console.error('Error adding result:', e);
            return false;
        }
    },

    // Add reject
    addReject: function(reject) {
        try {
            const rejects = this.getRejects();
            rejects.unshift(reject);
            return this.setItem(this.STORAGE_KEYS.REJECTS, JSON.stringify(rejects));
        } catch (e) {
            console.error('Error adding reject:', e);
            return false;
        }
    },

    // Add quality document - TO DATABASE ONLY
    addQualityDocument: async function(formData) {
        if (window.ServerSync) {
            return await ServerSync.addQualityDocument(formData);
        }
        console.error('ServerSync not available');
        return false;
    },

    // Delete quality document - FROM DATABASE ONLY
    deleteQualityDocument: async function(docId) {
        if (window.ServerSync) {
            return await ServerSync.deleteQualityDocument(docId);
        }
        console.error('ServerSync not available');
        return false;
    },

    // Update quality document
    updateQualityDocument: function(docId, updates) {
        try {
            const documents = this.getDocuments();
            const updated = documents.map(doc => {
                if (doc.id === docId) {
                    return { ...doc, ...updates, lastModified: new Date().toISOString() };
                }
                return doc;
            });
            return this.setItem(this.STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
        } catch (e) {
            console.error('Error updating quality document:', e);
            return false;
        }
    },

    // Increment quality document download count
    incrementQualityDocumentDownloads: function(docId) {
        try {
            const documents = this.getDocuments();
            const updated = documents.map(doc => {
                if (doc.id === docId) {
                    return { ...doc, downloads: (doc.downloads || 0) + 1 };
                }
                return doc;
            });
            return this.setItem(this.STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
        } catch (e) {
            console.error('Error updating download count:', e);
            return false;
        }
    },

    // Increment quality document view count
    incrementQualityDocumentViews: function(docId) {
        try {
            const documents = this.getDocuments();
            const updated = documents.map(doc => {
                if (doc.id === docId) {
                    return { ...doc, views: (doc.views || 0) + 1 };
                }
                return doc;
            });
            return this.setItem(this.STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));
        } catch (e) {
            console.error('Error updating view count:', e);
            return false;
        }
    },

    // Get statistics
    getStats: function() {
        const results = this.getResults();
        const documents = this.getDocuments();

        const totalControls = results.length;
        const conformControls = results.filter(r => r.status === 'success').length;
        const warningControls = results.filter(r => r.status === 'warning').length;
        const nonConformControls = results.filter(r => r.status === 'danger').length;

        const conformityRate = totalControls > 0
            ? ((conformControls / totalControls) * 100).toFixed(1)
            : 0;

        return {
            conformityRate: conformityRate,
            totalControls: totalControls,
            conformControls: conformControls,
            warningControls: warningControls,
            nonConformControls: nonConformControls,
            totalDocuments: documents.length
        };
    },

    // Get recent activities
    getActivities: function(limit = 10) {
        try {
            const data = this.getItem(this.STORAGE_KEYS.ACTIVITIES);
            const activities = data ? JSON.parse(data) : [];
            // Sort by timestamp (newest first) and limit
            return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
        } catch (e) {
            console.error('Error parsing activities data:', e);
            return [];
        }
    },

    // Add activity
    addActivity: function(activity) {
        try {
            const activities = this.getActivities(100); // Get more for storage
            const newActivity = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...activity
            };
            activities.unshift(newActivity);
            // Keep only last 50 activities
            const limitedActivities = activities.slice(0, 50);
            return this.setItem(this.STORAGE_KEYS.ACTIVITIES, JSON.stringify(limitedActivities));
        } catch (e) {
            console.error('Error adding activity:', e);
            return false;
        }
    },

    // Get quality checks
    getQualityChecks: function() {
        try {
            const data = this.getItem(this.STORAGE_KEYS.QUALITY_CHECKS);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error parsing quality checks data:', e);
            return [];
        }
    },

    // Add quality check
    addQualityCheck: function(check) {
        try {
            const checks = this.getQualityChecks();
            checks.unshift(check);
            return this.setItem(this.STORAGE_KEYS.QUALITY_CHECKS, JSON.stringify(checks));
        } catch (e) {
            console.error('Error adding quality check:', e);
            return false;
        }
    },

    // Get training documents - FROM DATABASE ONLY
    getTrainingDocuments: async function() {
        if (window.ServerSync) {
            return await ServerSync.getTrainingDocuments();
        }
        console.error('ServerSync not available');
        return [];
    },

    // Add training document - TO DATABASE ONLY
    addTrainingDocument: async function(formData) {
        if (window.ServerSync) {
            return await ServerSync.addTrainingDocument(formData);
        }
        console.error('ServerSync not available');
        return false;
    },

    // Delete training document - FROM DATABASE ONLY
    deleteTrainingDocument: async function(docId) {
        if (window.ServerSync) {
            return await ServerSync.deleteTrainingDocument(docId);
        }
        console.error('ServerSync not available');
        return false;
    },

    // Increment document download count
    incrementDownloadCount: function(docId) {
        try {
            const documents = this.getTrainingDocuments();
            const updated = documents.map(doc => {
                if (doc.id === docId) {
                    return { ...doc, downloads: (doc.downloads || 0) + 1 };
                }
                return doc;
            });
            return this.setItem(this.STORAGE_KEYS.TRAINING_DOCS, JSON.stringify(updated));
        } catch (e) {
            console.error('Error updating download count:', e);
            return false;
        }
    },

    // Get unique machines containing "MS" from rejects data
    getMSMachines: function() {
        try {
            const rejects = this.getRejects();
            const machines = new Set();

            rejects.forEach(reject => {
                if (reject.machine && reject.machine.includes('MS')) {
                    machines.add(reject.machine);
                }
            });

            // Convert to array and sort
            return Array.from(machines).sort();
        } catch (e) {
            console.error('Error getting MS machines:', e);
            return [];
        }
    },

    // Get documents by machine - FROM DATABASE ONLY
    getDocumentsByMachine: async function(machine) {
        if (window.ServerSync) {
            if (!machine || machine === 'all') {
                return await ServerSync.getQualityDocuments();
            }
            return await ServerSync.getQualityDocumentsByMachine(machine);
        }
        console.error('ServerSync not available');
        return [];
    },

    // Clear all data (useful for testing)
    clearAll: function() {
        try {
            if (this.isLocalStorageAvailable()) {
                localStorage.removeItem(this.STORAGE_KEYS.RESULTS);
                localStorage.removeItem(this.STORAGE_KEYS.DOCUMENTS);
                localStorage.removeItem(this.STORAGE_KEYS.REJECTS);
                localStorage.removeItem(this.STORAGE_KEYS.ACTIVITIES);
                localStorage.removeItem(this.STORAGE_KEYS.QUALITY_CHECKS);
                localStorage.removeItem(this.STORAGE_KEYS.TRAINING_DOCS);
                this.initializeSampleData();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Error clearing data:', e);
            return false;
        }
    }
};
