// Data Connector Module (Remplacement de Google Sheets)
const DataConnectorModule = {
    // Configuration
    config: {
        apiEndpoint: 'http://localhost:3000/api/data',
        autoRefresh: true,
        refreshInterval: 300000 // 5 minutes
    },

    isConnected: false,
    lastRefresh: null,
    refreshTimer: null,
    cachedData: [],

    // Initialize the module
    init: function () {
        console.log('Initializing Data Connector module...');

        // Load saved configuration
        this.loadConfiguration();

        // Auto-connect immediately
        this.connect();

        console.log('Data Connector module initialized');
    },

    // Load configuration
    loadConfiguration: function () {
        const savedConfig = localStorage.getItem('dataConnectorConfig');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                this.config = { ...this.config, ...parsed };
            } catch (error) {
                console.error('Error loading config:', error);
            }
        }
    },

    // Save configuration
    saveConfiguration: function () {
        localStorage.setItem('dataConnectorConfig', JSON.stringify(this.config));
    },

    // Connect to Local Server
    connect: async function () {
        try {
            await this.fetchData();
            this.isConnected = true;

            // Update UI
            this.updateUIStatus();

            if (this.config.autoRefresh) {
                this.startAutoRefresh();
            }

            return true;
        } catch (error) {
            console.error('Connection to local server failed:', error);
            this.isConnected = false;
            this.updateUIStatus(error.message);
            return false;
        }
    },

    // Fetch data from Local Server
    fetchData: async function () {
        try {
            const response = await fetch(this.config.apiEndpoint);

            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Erreur inconnue');
            }

            // Convert server data to application format
            const rejects = this.convertDataToRejects(result.data);

            this.cachedData = rejects;
            this.lastRefresh = new Date();

            // NOTE: localStorage désactivé pour supporter les gros fichiers Excel
            // Les données restent en mémoire pendant la session du navigateur
            console.log(`✅ ${rejects.length} enregistrements chargés en mémoire`);

            // Trigger data reload in consumers
            if (typeof RejectAnalysis !== 'undefined') {
                RejectAnalysis.loadRejectData();
            }

            if (typeof ProductionAnalysis !== 'undefined') {
                ProductionAnalysis.loadProductionData();
            }

            this.updateUIStatus();

            return rejects;
        } catch (error) {
            console.error('Error fetching local data:', error);
            throw error;
        }
    },

    // Get data (compatibility method)
    getData: function () {
        return this.cachedData;
    },

    // Get unique MS machines from cached data
    getMSMachines: function () {
        try {
            const machines = new Set();

            this.cachedData.forEach(record => {
                if (record.machine && record.machine.includes('MS')) {
                    machines.add(record.machine);
                }
            });

            // Convert to array and sort
            return Array.from(machines).sort();
        } catch (e) {
            console.error('Error getting MS machines:', e);
            return [];
        }
    },

    // Convert raw JSON to Rejects format
    convertDataToRejects: function (rows) {
        if (!rows || rows.length === 0) return [];

        return rows.map(row => {
            // Map keys (case insensitive search)
            const getVal = (keys) => {
                for (let k of keys) {
                    const foundKey = Object.keys(row).find(rk => rk.toLowerCase() === k.toLowerCase());
                    if (foundKey) return row[foundKey];
                }
                return null;
            };

            const dateVal = getVal(['date', 'confirmation date', 'Date']);
            const machineVal = getVal(['machine', 'WORKCENTER', 'Machine']);
            const materialVal = getVal(['material', 'matériel', 'Matériel']);
            const descVal = getVal(['description', 'designation', 'Description']);
            const qtyVal = getVal(['quantité', 'quantity', 'qte scrap', 'Quantité']);
            const prodQtyVal = getVal(['qte prod app', 'production quantity', 'productionquantity', 'QTE PROD APP']);
            const priceVal = getVal(['prix unitaire', 'unit price', 'prix unit', 'Prix UNIT', 'PRIX UNIT', 'Prix unitaire']);
            const reasonVal = getVal(['raison', 'reason', 'category', 'Raison']);
            const operatorVal = getVal(['opérateur', 'operator', 'Opérateur']);

            // Parse numbers - handle French format (comma as decimal separator)
            const parseNumber = (val) => {
                if (!val) return 0;
                // Convert to string and replace comma with dot
                const str = String(val).replace(',', '.');
                const num = parseFloat(str);
                return isNaN(num) ? 0 : num;
            };

            const scrapQty = parseNumber(qtyVal);
            const prodQty = parseNumber(prodQtyVal);
            const unitPrice = parseNumber(priceVal);

            // Debug: Log first row to see what we're getting
            if (rows.indexOf(row) === 1) {
                console.log('🔍 DEBUG - Première ligne de données:');
                console.log('Prix brut:', priceVal);
                console.log('Prix parsé:', unitPrice);
                console.log('Quantité:', scrapQty);
            }

            // Parse date
            let dateStr = null;
            if (dateVal) {
                dateStr = String(dateVal);
            }

            return {
                date: dateStr,
                machine: machineVal || '',
                material: materialVal || '',
                description: descVal || '',
                scrapQuantity: scrapQty,
                productionQuantity: prodQty,
                unitPrice: unitPrice,
                totalCost: scrapQty * unitPrice,
                reason: this.mapReason(reasonVal),
                operator: operatorVal || 'Serveur Local',
                workcenter: machineVal || ''
            };
        }); // Ne pas filtrer ici - laisser les modules consommateurs décider
    },

    mapReason: function (reason) {
        const r = (reason || '').toLowerCase();
        if (r.includes('dimension')) return 'dimension';
        if (r.includes('aspect') || r.includes('appearance')) return 'appearance';
        if (r.includes('fonction')) return 'function';
        if (r.includes('matière') || r.includes('material')) return 'material';
        return 'other';
    },

    updateUIStatus: function (errorMsg) {
        const statusEl = document.getElementById('server-status');
        if (!statusEl) return;

        if (this.isConnected) {
            const lastRefreshStr = this.lastRefresh ? this.lastRefresh.toLocaleString('fr-FR') : 'Jamais';
            statusEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="bi bi-hdd-network text-success fs-4"></i>
                    <div>
                        <strong>Connecté au Serveur Local</strong>
                        <br><small>Dernière mise à jour: ${lastRefreshStr}</small>
                        <br><small>${this.cachedData.length} enregistrements chargés</small>
                    </div>
                </div>
            `;
            statusEl.className = 'alert alert-success mt-3 mb-0';
            statusEl.style.display = 'block';
        } else if (errorMsg) {
            statusEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="bi bi-exclamation-triangle text-danger fs-4"></i>
                    <div>
                        <strong>Erreur de connexion</strong>
                        <br><small>${errorMsg}</small>
                        <br><small>Vérifiez que "node server.js" est lancé</small>
                    </div>
                </div>
            `;
            statusEl.className = 'alert alert-danger mt-3 mb-0';
            statusEl.style.display = 'block';
        }
    },

    startAutoRefresh: function () {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        this.refreshTimer = setInterval(() => this.fetchData(), this.config.refreshInterval);
    },

    stopAutoRefresh: function () {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
    }
};

// Expose globally
window.DataConnectorModule = DataConnectorModule;
// Alias for compatibility
window.GoogleSheetsModule = DataConnectorModule;
