// Data Manager - Manages all application data
const DataManager = {
    // Storage keys
    STORAGE_KEYS: {
        RESULTS: 'mg_quality_results',
        DOCUMENTS: 'mg_quality_documents',
        REJECTS: 'mg_quality_rejects',
        VERSION: 'mg_data_version'
    },

    DATA_VERSION: '2.0', // Increment this to force data refresh

    // Initialize data manager
    init: function() {
        const currentVersion = localStorage.getItem(this.STORAGE_KEYS.VERSION);

        // Load data from localStorage or use sample data
        // Also refresh data if version changed
        if (!localStorage.getItem(this.STORAGE_KEYS.RESULTS) || currentVersion !== this.DATA_VERSION) {
            this.initializeSampleData();
            localStorage.setItem(this.STORAGE_KEYS.VERSION, this.DATA_VERSION);
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

        const sampleDocuments = [
            { id: 'QC-2025-089', title: 'Contrôle qualité ligne A', date: formatDate(0), type: 'Contrôle' },
            { id: 'QC-2025-088', title: 'Audit production ligne B', date: formatDate(1), type: 'Audit' },
            { id: 'QC-2025-087', title: 'Rapport non-conformité', date: formatDate(2), type: 'NC' },
            { id: 'QC-2025-086', title: 'Validation process ligne C', date: formatDate(3), type: 'Validation' },
            { id: 'QC-2025-085', title: 'Contrôle qualité ligne D', date: formatDate(4), type: 'Contrôle' },
            { id: 'QC-2025-084', title: 'Certificat de conformité', date: formatDate(5), type: 'Certificat' },
            { id: 'QC-2025-083', title: 'Analyse défauts matière', date: formatDate(6), type: 'Analyse' },
            { id: 'QC-2025-082', title: 'Plan de contrôle Q4', date: formatDate(7), type: 'Plan' },
            { id: 'QC-2025-081', title: 'Rapport mensuel qualité', date: formatDate(8), type: 'Rapport' }
        ];

        const sampleRejects = [
            // Machine 850MS085 - CARCASSE DPN
            {
                date: formatDate(0),
                machine: '850MS085',
                workcenter: '850MS085',
                material: '04294964BE-EMB',
                description: 'MAGNETIC CONTACT FRAME',
                scrapQuantity: 589,
                unitPrice: 0.07601,
                totalCost: 44.77,
                reason: 'dimension',
                operator: 'Jean Dupont'
            },
            {
                date: formatDate(1),
                machine: '850MS085',
                workcenter: '850MS085',
                material: '04294964BE-EMB',
                description: 'MAGNETIC CONTACT FRAME',
                scrapQuantity: 150,
                unitPrice: 0.07601,
                totalCost: 11.40,
                reason: 'appearance',
                operator: 'Marie Martin'
            },
            // Machine MS123 - THERMIQUE iC60
            {
                date: formatDate(0),
                machine: 'MS123',
                workcenter: '850MS123',
                material: 'AAV83736-OTS',
                description: '20A MULTIPOLAR THERMAL SUB-ASSEMBLY',
                scrapQuantity: 150,
                unitPrice: 0.12173,
                totalCost: 18.26,
                reason: 'function',
                operator: 'Pierre Bernard'
            },
            {
                date: formatDate(2),
                machine: 'MS123',
                workcenter: '850MS123',
                material: 'AAV83737-OTS',
                description: 'S/E THERM 16A IC60',
                scrapQuantity: 110,
                unitPrice: 0.10281,
                totalCost: 11.31,
                reason: 'material',
                operator: 'Sophie Petit'
            },
            // Machine MS120 - CARCASSE
            {
                date: formatDate(1),
                machine: 'MS120',
                workcenter: '850MS120',
                material: '04290013AC-EMB',
                description: 'MAGNETIC CONTACT FRAME 25A',
                scrapQuantity: 300,
                unitPrice: 0.10502,
                totalCost: 31.51,
                reason: 'dimension',
                operator: 'Luc Dubois'
            },
            {
                date: formatDate(3),
                machine: 'MS120',
                workcenter: '850MS120',
                material: '04290013AC-EMB',
                description: 'MAGNETIC CONTACT FRAME 25A',
                scrapQuantity: 200,
                unitPrice: 0.10502,
                totalCost: 21.00,
                reason: 'appearance',
                operator: 'Anne Moreau'
            },
            // Machine MS135 - MECANO THERMIQUE
            {
                date: formatDate(0),
                machine: 'MS135',
                workcenter: '850MS135',
                material: 'BBV50831-EMB',
                description: '16A MULTIPOLAR MECANO THERMAL S/A IC60',
                scrapQuantity: 275,
                unitPrice: 0.16514,
                totalCost: 45.41,
                reason: 'function',
                operator: 'Thomas Laurent'
            },
            {
                date: formatDate(2),
                machine: 'MS135',
                workcenter: '850MS135',
                material: 'BBV50831-EMB',
                description: '16A MULTIPOLAR MECANO THERMAL S/A IC60',
                scrapQuantity: 300,
                unitPrice: 0.16514,
                totalCost: 49.54,
                reason: 'dimension',
                operator: 'Julie Simon'
            },
            // Machine MS122 - THERMIQUE iC60 >=25A
            {
                date: formatDate(1),
                machine: 'MS122',
                workcenter: '850MS122',
                material: 'GHC15229-EMB',
                description: '63A MULTIPOLAR THERMAL SUB-ASSEMBLY',
                scrapQuantity: 3000,
                unitPrice: 0.18441,
                totalCost: 553.23,
                reason: 'material',
                operator: 'Marc Michel'
            },
            {
                date: formatDate(4),
                machine: 'MS122',
                workcenter: '850MS122',
                material: 'GHC15229-EMB',
                description: '63A MULTIPOLAR THERMAL SUB-ASSEMBLY',
                scrapQuantity: 1500,
                unitPrice: 0.18441,
                totalCost: 276.62,
                reason: 'function',
                operator: 'Claire Lefevre'
            },
            // Machine MS158 - S/E THERMIQUE GRECO/ALADIM
            {
                date: formatDate(0),
                machine: 'MS158',
                workcenter: '850MS158',
                material: 'HRB73524',
                description: 'THERMAL S/A GRECO 16A (G16)',
                scrapQuantity: 110,
                unitPrice: 0.08997,
                totalCost: 9.90,
                reason: 'appearance',
                operator: 'Paul Leroy'
            },
            {
                date: formatDate(3),
                machine: 'MS158',
                workcenter: '850MS158',
                material: 'HRB73524',
                description: 'THERMAL S/A GRECO 16A (G16)',
                scrapQuantity: 120,
                unitPrice: 0.08997,
                totalCost: 10.80,
                reason: 'material',
                operator: 'Emma Roux'
            },
            // Machine H1131 - S/E CAPOT HUBLOT
            {
                date: formatDate(2),
                machine: 'H1131',
                workcenter: '550H1131',
                material: 'BBV26540',
                description: 'S/A UNIPOLAR FRONT HOOD & WINDOW',
                scrapQuantity: 102,
                unitPrice: 0.01837,
                totalCost: 1.87,
                reason: 'appearance',
                operator: 'Jean Dupont'
            },
            {
                date: formatDate(5),
                machine: 'H1131',
                workcenter: '550H1131',
                material: 'PHA21949',
                description: 'S/A FRONT HOOD AND WINDOW FOR VIGIDPN',
                scrapQuantity: 108,
                unitPrice: 0.03713,
                totalCost: 4.01,
                reason: 'dimension',
                operator: 'Marie Martin'
            },
            // Machine H1136 - LIGNE AUTO DE BOBINAGE
            {
                date: formatDate(1),
                machine: 'H1136',
                workcenter: '550H1136',
                material: 'BBV12165',
                description: 'COIL 30 REVERSED TURNS WIRE DIA 0,9',
                scrapQuantity: 50,
                unitPrice: 0.16102,
                totalCost: 8.05,
                reason: 'function',
                operator: 'Pierre Bernard'
            },
            {
                date: formatDate(4),
                machine: 'H1136',
                workcenter: '550H1136',
                material: '00726086JL',
                description: 'BOB 6A D1 20SP 2C C60',
                scrapQuantity: 80,
                unitPrice: 0.14652,
                totalCost: 11.72,
                reason: 'material',
                operator: 'Sophie Petit'
            },
            // Machine H1138 - INSERTION CONTACTO GRECO
            {
                date: formatDate(2),
                machine: 'H1138',
                workcenter: '550H1138',
                material: 'HRB73652-EMB',
                description: 'THERM/CONTACT SUBASSEM 16A',
                scrapQuantity: 32,
                unitPrice: 0.18875,
                totalCost: 6.04,
                reason: 'function',
                operator: 'Luc Dubois'
            },
            // Données supplémentaires pour les derniers jours
            {
                date: formatDate(5),
                machine: '850MS085',
                workcenter: '850MS085',
                material: '04294964BE-EMB',
                description: 'MAGNETIC CONTACT FRAME',
                scrapQuantity: 320,
                unitPrice: 0.07601,
                totalCost: 24.32,
                reason: 'material',
                operator: 'Anne Moreau'
            },
            {
                date: formatDate(6),
                machine: 'MS123',
                workcenter: '850MS123',
                material: 'AAV83737-OTS',
                description: 'S/E THERM 16A IC60',
                scrapQuantity: 95,
                unitPrice: 0.10281,
                totalCost: 9.77,
                reason: 'dimension',
                operator: 'Thomas Laurent'
            },
            {
                date: formatDate(7),
                machine: 'MS135',
                workcenter: '850MS135',
                material: 'BBV50831-EMB',
                description: '16A MULTIPOLAR MECANO THERMAL S/A IC60',
                scrapQuantity: 250,
                unitPrice: 0.16514,
                totalCost: 41.29,
                reason: 'appearance',
                operator: 'Julie Simon'
            }
        ];

        localStorage.setItem(this.STORAGE_KEYS.RESULTS, JSON.stringify(sampleResults));
        localStorage.setItem(this.STORAGE_KEYS.DOCUMENTS, JSON.stringify(sampleDocuments));
        localStorage.setItem(this.STORAGE_KEYS.REJECTS, JSON.stringify(sampleRejects));
    },

    // Get results
    getResults: function() {
        const data = localStorage.getItem(this.STORAGE_KEYS.RESULTS);
        return data ? JSON.parse(data) : [];
    },

    // Get documents
    getDocuments: function() {
        const data = localStorage.getItem(this.STORAGE_KEYS.DOCUMENTS);
        return data ? JSON.parse(data) : [];
    },

    // Get rejects
    getRejects: function() {
        const data = localStorage.getItem(this.STORAGE_KEYS.REJECTS);
        return data ? JSON.parse(data) : [];
    },

    // Add result
    addResult: function(result) {
        const results = this.getResults();
        results.unshift(result);
        localStorage.setItem(this.STORAGE_KEYS.RESULTS, JSON.stringify(results));
    },

    // Add reject
    addReject: function(reject) {
        const rejects = this.getRejects();
        rejects.unshift(reject);
        localStorage.setItem(this.STORAGE_KEYS.REJECTS, JSON.stringify(rejects));
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

    // Clear all data (useful for testing)
    clearAll: function() {
        localStorage.removeItem(this.STORAGE_KEYS.RESULTS);
        localStorage.removeItem(this.STORAGE_KEYS.DOCUMENTS);
        localStorage.removeItem(this.STORAGE_KEYS.REJECTS);
        this.initializeSampleData();
    }
};