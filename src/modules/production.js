// Production Analysis Module - Utilise les données partagées de GoogleSheetsModule
const ProductionAnalysis = {

    // Configuration des îlots avec leurs machines
    ilots: {
        PM1: ["135", "122", "123", "125"],
        PM2: ["143", "146", "150", "158"],
        BZ1: ["157", "104", "077", "087"],
        BZ2: ["071", "130", "155", "073"],
        GRM: ["070", "085", "086", "161", "120", "144", "091", "117"]
    },

    currentFilters: {
        ilot: "all",
        machine: "all",
        startDate: null,
        endDate: null
    },

    chart: null,
    revenueByMachineChart: null,
    revenueByIlotChart: null,
    isInitialized: false,

    // Obtenir toutes les machines 850MS depuis les données réelles
    getAllMSMachines: function() {
        // Utiliser les données réelles du serveur si disponibles
        if (GoogleSheetsModule?.getMSMachines) {
            const dynamicMachines = GoogleSheetsModule.getMSMachines();
            if (dynamicMachines.length > 0) {
                // Filtrer uniquement les machines 850MS
                return dynamicMachines.filter(m => m.startsWith('850MS'));
            }
        }

        // Fallback: utiliser la liste statique des îlots
        const machines = [];
        Object.values(this.ilots).forEach(ilotMachines => {
            ilotMachines.forEach(num => {
                machines.push(`850MS${num}`);
            });
        });
        return machines;
    },

    formatDateToISO: function(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    },

    formatDateToFrench: function(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },

    parseFrenchDate: function(dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    },

    // Parse date string in any format (DD/MM/YYYY, YYYY-MM-DD, YYYYMMDD, etc.)
    parseDate: function(dateStr) {
        if (!dateStr) return null;

        // Remove any time portion if present
        const datePart = String(dateStr).trim().split(' ')[0];

        // Try DD/MM/YYYY format first
        if (datePart.includes('/')) {
            const parts = datePart.split('/');
            if (parts.length === 3) {
                // Assume DD/MM/YYYY
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // 0-indexed
                const year = parseInt(parts[2]);
                return new Date(year, month, day);
            }
        }

        // Try YYYY-MM-DD format
        if (datePart.includes('-')) {
            const parts = datePart.split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                // YYYY-MM-DD format
                return new Date(datePart);
            }
        }

        // Try YYYYMMDD format (SAP compact format like "20250102")
        if (/^\d{8}$/.test(datePart)) {
            const year = parseInt(datePart.substring(0, 4));
            const month = parseInt(datePart.substring(4, 6)) - 1; // 0-indexed
            const day = parseInt(datePart.substring(6, 8));
            return new Date(year, month, day);
        }

        // Fallback to native Date parsing
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    },

    populateMachineFilter: function() {
        const machineFilter = document.getElementById('production-machine-filter');
        if (!machineFilter) return;

        const machines = this.getAllMSMachines();

        while (machineFilter.options.length > 1) {
            machineFilter.remove(1);
        }

        machines.forEach(machine => {
            const option = document.createElement('option');
            option.value = machine;
            option.textContent = machine;
            machineFilter.appendChild(option);
        });

        console.log(`Production filter populated with ${machines.length} machines 850MS`);
    },

    init: function() {
        if (this.isInitialized) return;

        console.log("ProductionAnalysis initialisation...");
        this.populateMachineFilter();
        this.setupEventListeners();

        // Default: last 30 days
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);

        const startDateFrench = this.formatDateToFrench(monthAgo);
        const endDateFrench = this.formatDateToFrench(today);

        const startDateEl = document.getElementById("production-start-date");
        const endDateEl = document.getElementById("production-end-date");
        const startPickerEl = document.getElementById("production-start-date-picker");
        const endPickerEl = document.getElementById("production-end-date-picker");

        if (startDateEl) startDateEl.value = startDateFrench;
        if (endDateEl) endDateEl.value = endDateFrench;
        if (startPickerEl) startPickerEl.value = this.formatDateToISO(monthAgo);
        if (endPickerEl) endPickerEl.value = this.formatDateToISO(today);

        this.currentFilters.startDate = startDateFrench;
        this.currentFilters.endDate = endDateFrench;

        this.isInitialized = true;

        // Attendre les données et charger
        this.showLoading("Chargement des données de production...");
        this.waitForDataAndLoad();
    },

    showLoading: function(message) {
        const loadingEl = document.getElementById("production-loading");
        const statsGrid = document.getElementById("production-stats-grid");
        const messageEl = loadingEl?.querySelector('p');

        if (loadingEl) loadingEl.style.display = "flex";
        if (statsGrid) statsGrid.style.opacity = "0.3";
        if (messageEl && message) messageEl.textContent = message;
    },

    hideLoading: function() {
        const loadingEl = document.getElementById("production-loading");
        const statsGrid = document.getElementById("production-stats-grid");

        if (loadingEl) loadingEl.style.display = "none";
        if (statsGrid) statsGrid.style.opacity = "1";
    },

    waitForDataAndLoad: function() {
        const maxAttempts = 60; // 30 secondes max
        let attempts = 0;

        const checkAndLoad = () => {
            attempts++;

            if (GoogleSheetsModule?.isConnected && GoogleSheetsModule.getData().length > 0) {
                console.log("Production: Google Sheets data ready");
                this.loadProductionData();
            } else if (attempts >= maxAttempts) {
                console.error("Production: Timeout waiting for data");
                this.hideLoading();
            } else {
                setTimeout(checkAndLoad, 500);
            }
        };

        checkAndLoad();
    },

    // Appelé par GoogleSheetsModule après chargement des données
    loadProductionData: function() {
        console.log("Production: Loading data...");

        let rawData = [];

        if (GoogleSheetsModule?.isConnected) {
            rawData = GoogleSheetsModule.getData();
        } else {
            console.error("Production: Google Sheets not connected");
            this.hideLoading();
            return;
        }

        // Repeupler le filtre des machines avec les données réelles
        this.populateMachineFilter();

        // Filtrer pour les données de production (machines 850MS avec productionQuantity)
        // Note: Inclut aussi les valeurs négatives de QTE PROD APP
        const productionData = rawData.filter(r => {
            return r.machine &&
                   r.machine.startsWith('850MS') &&
                   r.productionQuantity !== undefined &&
                   r.productionQuantity !== null &&
                   r.productionQuantity !== 0;
        });

        console.log(`Production: ${productionData.length} records with production data`);

        const filtered = this.filterProductionData(productionData);

        this.updateStatistics(filtered);
        this.displayProductionTable(filtered);
        this.renderProductionChart(filtered);
        this.renderRevenueByMachineChart(filtered);
        this.renderRevenueByIlotChart(filtered);

        this.hideLoading();
    },

    setupEventListeners: function() {
        const applyFilters = () => {
            const ilotEl = document.getElementById("production-ilot-filter");
            const machineEl = document.getElementById("production-machine-filter");
            const startEl = document.getElementById("production-start-date");
            const endEl = document.getElementById("production-end-date");

            if (ilotEl) this.currentFilters.ilot = ilotEl.value;
            if (machineEl) this.currentFilters.machine = machineEl.value;
            if (startEl) this.currentFilters.startDate = startEl.value;
            if (endEl) this.currentFilters.endDate = endEl.value;

            this.loadProductionData();
        };

        document.getElementById("production-ilot-filter")?.addEventListener("change", () => {
            this.updateMachineFilterByIlot();
            applyFilters();
        });

        document.getElementById("production-machine-filter")?.addEventListener("change", applyFilters);
        document.getElementById("production-start-date")?.addEventListener("change", applyFilters);
        document.getElementById("production-end-date")?.addEventListener("change", applyFilters);
    },

    updateMachineFilterByIlot: function() {
        const ilotFilter = document.getElementById("production-ilot-filter");
        const machineFilter = document.getElementById("production-machine-filter");
        if (!ilotFilter || !machineFilter) return;

        const selectedIlot = ilotFilter.value;

        machineFilter.innerHTML = '<option value="all">Toutes les machines</option>';

        const allMachines = this.getAllMSMachines();

        if (selectedIlot === "all") {
            allMachines.forEach(machine => {
                const option = document.createElement('option');
                option.value = machine;
                option.textContent = machine;
                machineFilter.appendChild(option);
            });
        } else {
            const ilotMachineNumbers = this.ilots[selectedIlot] || [];
            allMachines.forEach(machine => {
                const machineNum = String(machine.replace("850MS", ""));
                if (ilotMachineNumbers.includes(machineNum)) {
                    const option = document.createElement('option');
                    option.value = machine;
                    option.textContent = machine;
                    machineFilter.appendChild(option);
                }
            });
        }

        machineFilter.value = "all";
        this.currentFilters.machine = "all";
    },

    filterProductionData: function(data) {
        return data.filter(r => {
            if (!r.date || !r.machine) return false;

            // Filtrage par îlot
            if (this.currentFilters.ilot !== "all") {
                const ilotMachineNumbers = this.ilots[this.currentFilters.ilot] || [];
                const machineNum = String(r.machine.replace("850MS", ""));
                if (!ilotMachineNumbers.includes(machineNum)) {
                    return false;
                }
            }

            // Machine
            if (this.currentFilters.machine !== "all" && r.machine !== this.currentFilters.machine) {
                return false;
            }

            // Date filtering - Parse the production date properly
            const d = this.parseDate(r.date);
            const dStart = this.parseFrenchDate(this.currentFilters.startDate);
            const dEnd = this.parseFrenchDate(this.currentFilters.endDate);

            if (!d) return false; // Invalid date, exclude
            if (!dStart || !dEnd) return true; // If filter dates invalid, don't filter

            // Set time to start/end of day for proper comparison
            d.setHours(0, 0, 0, 0);
            dStart.setHours(0, 0, 0, 0);
            dEnd.setHours(23, 59, 59, 999);

            if (d < dStart || d > dEnd) return false;

            return true;
        });
    },

    getIlotForMachine: function(machine) {
        const machineNum = String(machine.replace("850MS", ""));
        for (const [ilot, machines] of Object.entries(this.ilots)) {
            if (machines.includes(machineNum)) {
                return ilot;
            }
        }
        return "-";
    },

    updateStatistics: function(data) {
        // Compter les valeurs positives et négatives
        // Les valeurs négatives sont SOUSTRAITES de la somme (pas ignorées)
        let positiveCount = 0;
        let negativeCount = 0;
        let positiveSum = 0;
        let negativeSum = 0;

        data.forEach(r => {
            const qty = r.productionQuantity || 0;
            if (qty > 0) {
                positiveCount++;
                positiveSum += qty;
            } else if (qty < 0) {
                negativeCount++;
                negativeSum += qty; // Négatif, donc se soustrait
            }
        });

        // Calculer le total en incluant TOUTES les valeurs (positives + négatives)
        const totalQty = data.reduce((sum, r) => sum + (r.productionQuantity || 0), 0);

        console.log('=== DEBUG PRODUCTION ===');
        console.log(`Total lignes: ${data.length}`);
        console.log(`Valeurs positives: ${positiveCount} (somme: ${positiveSum.toLocaleString('fr-FR')})`);
        console.log(`Valeurs négatives: ${negativeCount} (somme: ${negativeSum.toLocaleString('fr-FR')})`);
        console.log(`Total calculé (positives + négatives): ${totalQty.toLocaleString('fr-FR')}`);
        console.log('========================');

        const machines = {};
        data.forEach(r => {
            const qty = r.productionQuantity || 0;
            // Inclure TOUTES les valeurs (positives ET négatives)
            if (qty !== 0) {
                if (!machines[r.machine]) {
                    machines[r.machine] = { qty: 0, prices: [] };
                }
                machines[r.machine].qty += qty; // Ajoute même si négatif (se soustrait auto)
                if (r.unitPrice > 0) {
                    machines[r.machine].prices.push(r.unitPrice);
                }
            }
        });

        // Calculer le chiffre d'affaires
        let totalRevenue = 0;
        Object.keys(machines).forEach(machine => {
            const m = machines[machine];
            const avgPrice = m.prices.length > 0
                ? m.prices.reduce((a, b) => a + b, 0) / m.prices.length
                : 0;
            m.revenue = m.qty * avgPrice;
            totalRevenue += m.revenue;
        });

        let topMachine = "-";
        if (Object.keys(machines).length > 0) {
            topMachine = Object.entries(machines).sort((a, b) => b[1].qty - a[1].qty)[0][0];
        }

        const machineCount = Object.keys(machines).length;
        const avgProduction = machineCount > 0 ? Math.round(totalQty / machineCount) : 0;

        const totalQtyEl = document.getElementById("total-production-quantity");
        const totalRevenueEl = document.getElementById("total-production-revenue");
        const topMachineEl = document.getElementById("top-production-machine");
        const avgProductionEl = document.getElementById("average-production");

        if (totalQtyEl) totalQtyEl.textContent = totalQty.toLocaleString('fr-FR');
        if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
        if (topMachineEl) topMachineEl.textContent = topMachine;
        if (avgProductionEl) avgProductionEl.textContent = avgProduction.toLocaleString('fr-FR');
    },

    displayProductionTable: function(data) {
        const tbody = document.getElementById("production-table-body");
        if (!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Aucune donnée de production trouvée</td></tr>`;
            return;
        }

        const machines = {};

        data.forEach(r => {
            const qty = r.productionQuantity || 0;
            // Inclure toutes les valeurs (positives ET négatives)
            if (qty !== 0) {
                if (!machines[r.machine]) {
                    machines[r.machine] = {
                        qty: 0,
                        prices: [],
                        ilot: this.getIlotForMachine(r.machine)
                    };
                }
                machines[r.machine].qty += qty; // Se soustrait si négatif
                if (r.unitPrice > 0) {
                    machines[r.machine].prices.push(r.unitPrice);
                }
            }
        });

        // Calculer le chiffre d'affaires par machine
        Object.keys(machines).forEach(machine => {
            const m = machines[machine];
            const avgPrice = m.prices.length > 0
                ? m.prices.reduce((a, b) => a + b, 0) / m.prices.length
                : 0;
            m.revenue = m.qty * avgPrice;
        });

        const totalQty = Object.values(machines).reduce((s, m) => s + m.qty, 0);

        let html = "";

        Object.keys(machines).sort((a, b) => machines[b].qty - machines[a].qty)
            .forEach(machine => {
                const m = machines[machine];
                const pct = totalQty > 0 ? (m.qty / totalQty) * 100 : 0;

                html += `
                <tr>
                    <td><strong>${machine}</strong></td>
                    <td><span class="badge bg-success">${m.ilot}</span></td>
                    <td>${m.qty.toLocaleString('fr-FR')}</td>
                    <td>${m.revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</td>
                    <td>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar bg-success" role="progressbar" style="width: ${pct}%;">
                                ${pct.toFixed(1)}%
                            </div>
                        </div>
                    </td>
                </tr>`;
            });

        tbody.innerHTML = html;
    },

    renderProductionChart: function(data) {
        const canvas = document.getElementById("production-chart");
        if (!canvas) return;

        if (this.chart) this.chart.destroy();

        if (data.length === 0) {
            this.chart = new Chart(canvas, { type: "bar", data: { labels: [], datasets: [] } });
            return;
        }

        const machines = {};
        data.forEach(r => {
            const qty = r.productionQuantity || 0;
            // Inclure toutes les valeurs (positives ET négatives)
            if (qty !== 0) {
                if (!machines[r.machine]) machines[r.machine] = 0;
                machines[r.machine] += qty; // Se soustrait si négatif
            }
        });

        const sortedMachines = Object.entries(machines).sort((a, b) => b[1] - a[1]).slice(0, 15);

        const labels = sortedMachines.map(m => m[0]);
        const values = sortedMachines.map(m => m[1]);

        const colors = labels.map(machine => {
            const ilot = this.getIlotForMachine(machine);
            switch(ilot) {
                case 'PM1': return 'rgba(59, 130, 246, 0.8)';
                case 'PM2': return 'rgba(16, 185, 129, 0.8)';
                case 'BZ1': return 'rgba(245, 158, 11, 0.8)';
                case 'BZ2': return 'rgba(239, 68, 68, 0.8)';
                case 'GRM': return 'rgba(139, 92, 246, 0.8)';
                default: return 'rgba(107, 114, 128, 0.8)';
            }
        });

        this.chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Quantité produite",
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Production: ${context.parsed.y.toLocaleString('fr-FR')} pièces`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR');
                            }
                        }
                    }
                }
            }
        });
    },

    renderRevenueByMachineChart: function(data) {
        const canvas = document.getElementById("revenue-by-machine-chart");
        if (!canvas) return;

        if (this.revenueByMachineChart) this.revenueByMachineChart.destroy();

        if (data.length === 0) {
            this.revenueByMachineChart = new Chart(canvas, { type: "bar", data: { labels: [], datasets: [] } });
            return;
        }

        const machines = {};
        data.forEach(r => {
            const qty = r.productionQuantity || 0;
            // Inclure toutes les valeurs (positives ET négatives)
            if (qty !== 0) {
                if (!machines[r.machine]) {
                    machines[r.machine] = { qty: 0, prices: [], ilot: this.getIlotForMachine(r.machine) };
                }
                machines[r.machine].qty += qty; // Se soustrait si négatif
                if (r.unitPrice > 0) {
                    machines[r.machine].prices.push(r.unitPrice);
                }
            }
        });

        // Calculer le CA
        Object.keys(machines).forEach(machine => {
            const m = machines[machine];
            const avgPrice = m.prices.length > 0
                ? m.prices.reduce((a, b) => a + b, 0) / m.prices.length
                : 0;
            m.revenue = m.qty * avgPrice;
        });

        const sortedMachines = Object.entries(machines).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 10);

        const labels = sortedMachines.map(m => m[0]);
        const values = sortedMachines.map(m => m[1].revenue);

        const colors = labels.map(machine => {
            const ilot = this.getIlotForMachine(machine);
            switch(ilot) {
                case 'PM1': return 'rgba(59, 130, 246, 0.8)';
                case 'PM2': return 'rgba(16, 185, 129, 0.8)';
                case 'BZ1': return 'rgba(245, 158, 11, 0.8)';
                case 'BZ2': return 'rgba(239, 68, 68, 0.8)';
                case 'GRM': return 'rgba(139, 92, 246, 0.8)';
                default: return 'rgba(107, 114, 128, 0.8)';
            }
        });

        this.revenueByMachineChart = new Chart(canvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Chiffre d'affaires (€)",
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `CA: ${context.parsed.x.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('fr-FR') + '€';
                            }
                        }
                    }
                }
            }
        });
    },

    renderRevenueByIlotChart: function(data) {
        const canvas = document.getElementById("revenue-by-ilot-chart");
        if (!canvas) return;

        if (this.revenueByIlotChart) this.revenueByIlotChart.destroy();

        if (data.length === 0) {
            this.revenueByIlotChart = new Chart(canvas, { type: "doughnut", data: { labels: [], datasets: [] } });
            return;
        }

        // Agréger par machine d'abord
        const machines = {};
        data.forEach(r => {
            const qty = r.productionQuantity || 0;
            // Inclure toutes les valeurs (positives ET négatives)
            if (qty !== 0) {
                if (!machines[r.machine]) {
                    machines[r.machine] = { qty: 0, prices: [], ilot: this.getIlotForMachine(r.machine) };
                }
                machines[r.machine].qty += qty; // Se soustrait si négatif
                if (r.unitPrice > 0) {
                    machines[r.machine].prices.push(r.unitPrice);
                }
            }
        });

        // Calculer le CA par îlot
        const ilots = { PM1: 0, PM2: 0, BZ1: 0, BZ2: 0, GRM: 0 };

        Object.keys(machines).forEach(machine => {
            const m = machines[machine];
            const avgPrice = m.prices.length > 0
                ? m.prices.reduce((a, b) => a + b, 0) / m.prices.length
                : 0;
            const revenue = m.qty * avgPrice;
            if (ilots[m.ilot] !== undefined) {
                ilots[m.ilot] += revenue;
            }
        });

        const sortedIlots = Object.entries(ilots).filter(([_, v]) => v > 0).sort((a, b) => b[1] - a[1]);

        const labels = sortedIlots.map(i => i[0]);
        const values = sortedIlots.map(i => i[1]);

        const colorMap = {
            'PM1': 'rgba(59, 130, 246, 0.8)',
            'PM2': 'rgba(16, 185, 129, 0.8)',
            'BZ1': 'rgba(245, 158, 11, 0.8)',
            'BZ2': 'rgba(239, 68, 68, 0.8)',
            'GRM': 'rgba(139, 92, 246, 0.8)'
        };

        const colors = labels.map(ilot => colorMap[ilot] || 'rgba(107, 114, 128, 0.8)');

        this.revenueByIlotChart = new Chart(canvas, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€ (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
};

// Auto-init
document.addEventListener("DOMContentLoaded", () => ProductionAnalysis.init());
