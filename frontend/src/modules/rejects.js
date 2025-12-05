// Reject Analysis Module (VERSION FINALE CORRIGÉE)
const RejectAnalysis = {

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
        material: "all",
        startDate: null,
        endDate: null
    },

    chart: null,

    // Convert Date object to ISO format (YYYY-MM-DD) for input[type=date]
    formatDateToISO: function (date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    },

    // Convert Date object to DD/MM/YYYY format for display
    formatDateToFrench: function (date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },

    // Convert ISO date (YYYY-MM-DD) to Date object
    parseISODate: function (dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    },

    // Convert DD/MM/YYYY to Date object
    parseFrenchDate: function (dateStr) {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        // Month is 0-indexed in JavaScript Date
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    },

    // Populate machine filter with all MS machines
    populateMachineFilter: function () {
        const machineFilter = document.getElementById('reject-machine-filter');
        if (!machineFilter) return;

        // Get all MS machines from DataManager
        const machines = DataManager.getMSMachines();

        // Keep the "Toutes les machines" option and clear the rest
        while (machineFilter.options.length > 1) {
            machineFilter.remove(1);
        }

        // Add all machines
        machines.forEach(machine => {
            const option = document.createElement('option');
            option.value = machine;
            option.textContent = machine;
            machineFilter.appendChild(option);
        });

        console.log(`Filter populated with ${machines.length} machines`);
    },

    // Populate material filter with MS machine references only
    populateMaterialFilter: function () {
        const materialFilter = document.getElementById('reject-material-filter');
        if (!materialFilter) return;

        // Get all rejects data
        let rejects = [];
        if (DataConnectorModule?.isConnected) {
            rejects = DataConnectorModule.getData();
        } else {
            rejects = DataManager.getRejects();
        }

        // Extract unique materials from MS machines only
        const materials = new Set();
        rejects.forEach(r => {
            if (r.machine && r.machine.startsWith("850MS") && r.material) {
                materials.add(r.material);
            }
        });

        // Keep the "Toutes les références" option and clear the rest
        while (materialFilter.options.length > 1) {
            materialFilter.remove(1);
        }

        // Add all MS machine materials sorted
        Array.from(materials).sort().forEach(material => {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            materialFilter.appendChild(option);
        });

        console.log(`Material filter populated with ${materials.size} MS references`);
    },

    init: function () {
        console.log("RejectAnalysis initialisation...");
        this.populateMachineFilter();
        this.populateMaterialFilter();
        this.setupEventListeners();

        // Default: last 30 days
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);

        // Store dates in French format for display
        const startDateFrench = this.formatDateToFrench(monthAgo);
        const endDateFrench = this.formatDateToFrench(today);

        // Set both text and picker inputs
        document.getElementById("reject-start-date").value = startDateFrench;
        document.getElementById("reject-end-date").value = endDateFrench;

        document.getElementById("reject-start-date-picker").value = this.formatDateToISO(monthAgo);
        document.getElementById("reject-end-date-picker").value = this.formatDateToISO(today);

        // Store in French format
        this.currentFilters.startDate = startDateFrench;
        this.currentFilters.endDate = endDateFrench;

        // Show loading indicator
        this.showLoading();

        // Wait for Google Sheets to be ready, then load data
        this.waitForDataAndLoad();
    },

    // Show loading indicator
    showLoading: function () {
        const loadingEl = document.getElementById("rejects-loading");
        const statsGrid = document.getElementById("reject-stats-grid");
        const container = document.querySelector(".rejects-container");

        if (loadingEl) loadingEl.style.display = "flex";
        if (statsGrid) statsGrid.style.opacity = "0.3";
        if (container) container.style.opacity = "0.3";
    },

    // Hide loading indicator
    hideLoading: function () {
        const loadingEl = document.getElementById("rejects-loading");
        const statsGrid = document.getElementById("reject-stats-grid");
        const container = document.querySelector(".rejects-container");

        if (loadingEl) loadingEl.style.display = "none";
        if (statsGrid) statsGrid.style.opacity = "1";
        if (container) container.style.opacity = "1";
    },

    // Wait for Google Sheets data to be available
    waitForDataAndLoad: function () {
        const maxAttempts = 30; // 15 seconds max wait time
        let attempts = 0;

        const checkAndLoad = () => {
            attempts++;

            if (DataConnectorModule?.isConnected && DataConnectorModule.getData().length > 0) {
                console.log("Data Connector data ready, loading...");
                this.populateMaterialFilter(); // Update material filter with loaded data
                this.hideLoading();
                this.loadRejectData();
            } else if (attempts >= maxAttempts) {
                console.error("Timeout waiting for data");
                this.hideLoading();
                // this.showNoDataMessage(); // Message désactivé par l'utilisateur
            } else {
                console.log(`Waiting for data... (attempt ${attempts}/${maxAttempts})`);
                setTimeout(checkAndLoad, 500);
            }
        };

        checkAndLoad();
    },

    // Show message when no data is available
    showNoDataMessage: function () {
        const statusEl = document.getElementById("google-sheets-status");
        if (statusEl) {
            statusEl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i>
                    <strong>Aucune donnée disponible. Veuillez vous connecter à Google Sheets.</strong>
                </div>
            `;
            statusEl.className = 'alert alert-warning';
            statusEl.style.display = 'block';
        }
    },

    // EVENT LISTENERS
    setupEventListeners: function () {
        // Fonction pour appliquer les filtres automatiquement
        const applyFilters = () => {
            this.currentFilters.ilot = document.getElementById("reject-ilot-filter").value;
            this.currentFilters.machine = document.getElementById("reject-machine-filter").value;
            this.currentFilters.material = document.getElementById("reject-material-filter").value;
            this.currentFilters.startDate = document.getElementById("reject-start-date").value;
            this.currentFilters.endDate = document.getElementById("reject-end-date").value;
            this.loadRejectData();
        };

        // Filtrage automatique sur changement d'îlot
        document.getElementById("reject-ilot-filter")?.addEventListener("change", () => {
            this.updateMachineFilterByIlot();
            applyFilters();
        });

        // Filtrage automatique sur changement de machine
        document.getElementById("reject-machine-filter")?.addEventListener("change", () => {
            this.updateMaterialFilterByMachine();
            applyFilters();
        });

        // Filtrage automatique sur changement de référence
        document.getElementById("reject-material-filter")?.addEventListener("change", applyFilters);

        // Filtrage automatique sur changement de date de début
        document.getElementById("reject-start-date")?.addEventListener("change", applyFilters);

        // Filtrage automatique sur changement de date de fin
        document.getElementById("reject-end-date")?.addEventListener("change", applyFilters);

        // Garder le bouton filtrer pour compatibilité (optionnel)
        document.getElementById("apply-reject-filters")?.addEventListener("click", applyFilters);

        // Sync hidden date pickers with text inputs
        this.setupDatePickerSync();
    },

    // Setup date picker synchronization
    setupDatePickerSync: function() {
        const startDateText = document.getElementById("reject-start-date");
        const endDateText = document.getElementById("reject-end-date");
        const startDatePicker = document.getElementById("reject-start-date-picker");
        const endDatePicker = document.getElementById("reject-end-date-picker");

        if (!startDateText || !endDateText || !startDatePicker || !endDatePicker) return;

        // When clicking on text input or calendar icon, open the date picker
        startDateText.addEventListener("click", () => {
            startDatePicker.showPicker?.();
        });

        endDateText.addEventListener("click", () => {
            endDatePicker.showPicker?.();
        });

        // When date picker changes, update text input with French format
        startDatePicker.addEventListener("change", () => {
            const isoDate = startDatePicker.value; // YYYY-MM-DD
            if (isoDate) {
                const [year, month, day] = isoDate.split('-');
                const frenchDate = `${day}/${month}/${year}`;
                startDateText.value = frenchDate;

                // Trigger the filter
                this.currentFilters.startDate = frenchDate;
                this.loadRejectData();
            }
        });

        endDatePicker.addEventListener("change", () => {
            const isoDate = endDatePicker.value; // YYYY-MM-DD
            if (isoDate) {
                const [year, month, day] = isoDate.split('-');
                const frenchDate = `${day}/${month}/${year}`;
                endDateText.value = frenchDate;

                // Trigger the filter
                this.currentFilters.endDate = frenchDate;
                this.loadRejectData();
            }
        });
    },

    // Mettre à jour le filtre machine en fonction de l'îlot sélectionné
    updateMachineFilterByIlot: function () {
        const ilotFilter = document.getElementById("reject-ilot-filter");
        const machineFilter = document.getElementById("reject-machine-filter");
        if (!ilotFilter || !machineFilter) return;

        const selectedIlot = ilotFilter.value;

        // Réinitialiser le filtre machine
        machineFilter.innerHTML = '<option value="all">Toutes les machines</option>';

        // Obtenir toutes les machines disponibles
        const allMachines = DataManager.getMSMachines();

        if (selectedIlot === "all") {
            // Afficher toutes les machines
            allMachines.forEach(machine => {
                const option = document.createElement('option');
                option.value = machine;
                option.textContent = machine;
                machineFilter.appendChild(option);
            });
        } else {
            // Filtrer les machines de l'îlot sélectionné
            const ilotMachineNumbers = this.ilots[selectedIlot] || [];
            allMachines.forEach(machine => {
                // Extraire le numéro de la machine (ex: 850MS122 -> 122)
                const machineNum = String(machine.replace("850MS", ""));
                if (ilotMachineNumbers.includes(machineNum)) {
                    const option = document.createElement('option');
                    option.value = machine;
                    option.textContent = machine;
                    machineFilter.appendChild(option);
                }
            });
        }

        // Réinitialiser la sélection
        machineFilter.value = "all";
        this.currentFilters.machine = "all";
    },

    // Mettre à jour le filtre de référence en fonction de la machine sélectionnée
    updateMaterialFilterByMachine: function () {
        const machineFilter = document.getElementById("reject-machine-filter");
        const materialFilter = document.getElementById("reject-material-filter");
        if (!machineFilter || !materialFilter) return;

        const selectedMachine = machineFilter.value;

        // Get all rejects data
        let rejects = [];
        if (DataConnectorModule?.isConnected) {
            rejects = DataConnectorModule.getData();
        } else {
            rejects = DataManager.getRejects();
        }

        // Extract unique materials
        const materials = new Set();
        rejects.forEach(r => {
            if (r.machine && r.machine.startsWith("850MS") && r.material) {
                // Si une machine est sélectionnée, filtrer par cette machine
                if (selectedMachine === "all" || r.machine === selectedMachine) {
                    materials.add(r.material);
                }
            }
        });

        // Réinitialiser le filtre de référence
        materialFilter.innerHTML = '<option value="all">Toutes les références</option>';

        // Ajouter les références triées
        Array.from(materials).sort().forEach(material => {
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            materialFilter.appendChild(option);
        });

        // Réinitialiser la sélection
        materialFilter.value = "all";
        this.currentFilters.material = "all";
    },

    // LOAD DATA
    loadRejectData: function () {
        let rejects = [];

        if (DataConnectorModule?.isConnected) {
            console.log("Loading from Data Connector...");
            rejects = DataConnectorModule.getData();
        } else {
            console.error("Data Connector NOT connected");
            this.hideLoading();
            return;
        }

        console.log("Total rejects:", rejects.length);

        const filtered = this.filterRejects(rejects);

        console.log("Filtered rejects:", filtered.length);

        this.updateStatistics(filtered);
        this.displayMachineCostsTable(filtered);
        this.displayDetailedRejectsTable(filtered);
        this.renderRejectChart(filtered);

        // Ensure loading is hidden after data is displayed
        this.hideLoading();
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

    // FILTERING
    filterRejects: function (rejects) {
        return rejects.filter(r => {
            if (!r.date || !r.machine) return false;

            // Filtrer uniquement les rebuts (scrapQuantity > 0)
            if (!r.scrapQuantity || r.scrapQuantity <= 0) {
                return false;
            }

            // Filtrer uniquement les machines spéciales (commencent par 850MS)
            if (!r.machine.startsWith("850MS")) {
                return false;
            }

            // Filtrage par îlot
            if (this.currentFilters.ilot !== "all") {
                const ilotMachineNumbers = this.ilots[this.currentFilters.ilot] || [];
                const machineNum = String(r.machine.replace("850MS", ""));
                if (!ilotMachineNumbers.includes(machineNum)) {
                    return false;
                }
            }

            // Machine
            if (this.currentFilters.machine !== "all" &&
                r.machine !== this.currentFilters.machine) {
                return false;
            }

            // Material (référence produit)
            if (this.currentFilters.material !== "all" &&
                r.material !== this.currentFilters.material) {
                return false;
            }

            // Date filtering - Parse the reject date properly
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

    // STAT CARDS
    updateStatistics: function (rejects) {
        const totalQty = rejects.reduce((sum, r) => sum + r.scrapQuantity, 0);

        // Calculer le coût total : somme de (quantité × prix unitaire) par ligne
        // IMPORTANT: Ne pas moyenner les prix, calculer ligne par ligne comme la page îlot
        let totalCost = 0;
        const costByMachine = {};

        rejects.forEach(r => {
            const lineCost = r.scrapQuantity * r.unitPrice;
            totalCost += lineCost;

            if (!costByMachine[r.machine]) {
                costByMachine[r.machine] = 0;
            }
            costByMachine[r.machine] += lineCost;
        });

        // Calculer le taux de non-conformité
        // Formule : (Quantité rebuts) / (Quantité produite + Quantité rebuts) * 100
        const nonConformityRate = this.calculateNonConformityRate(rejects);

        // Coût moyen par pièce rebutée
        const avgCostPerUnit = totalQty > 0 ? totalCost / totalQty : 0;

        document.getElementById("total-reject-cost").textContent = totalCost.toFixed(2) + "€";
        document.getElementById("total-reject-quantity").textContent = totalQty;
        document.getElementById("non-conformity-rate").textContent = nonConformityRate.toFixed(2) + "%";
        document.getElementById("average-reject-cost").textContent = avgCostPerUnit.toFixed(4) + "€";
    },

    // Calculer le taux de non-conformité
    calculateNonConformityRate: function(rejects) {
        // Récupérer toutes les données pour la même période
        let allData = [];
        if (DataConnectorModule?.isConnected) {
            allData = DataConnectorModule.getData();
        } else {
            return 0;
        }

        // Filtrer les données selon les mêmes critères que les rebuts
        const filteredData = this.filterProductionData(allData);

        // Calculer la quantité totale produite ET la quantité totale de rebuts
        let totalProduced = 0;
        let totalRejectsFromData = 0;

        filteredData.forEach(item => {
            // Ajouter la production (productionQuantity ou confirmedQuantity)
            const prodQty = item.productionQuantity || item.confirmedQuantity || 0;
            if (prodQty > 0) {
                totalProduced += prodQty;
            }

            // Ajouter les rebuts
            const scrapQty = item.scrapQuantity || 0;
            if (scrapQty > 0) {
                totalRejectsFromData += scrapQty;
            }
        });

        // Debug - afficher les valeurs
        console.log('=== CALCUL TAUX DE NON-CONFORMITÉ ===');
        console.log('Nombre total de lignes filtrées:', filteredData.length);
        console.log('Quantité produite totale:', totalProduced);
        console.log('Quantité rebuts totale:', totalRejectsFromData);

        // Calculer le taux de non-conformité
        // Formule : Rebuts / (Production + Rebuts) * 100
        const totalItems = totalProduced + totalRejectsFromData;
        if (totalItems === 0) {
            console.log('Taux de non-conformité: 0% (aucune donnée)');
            return 0;
        }

        const rate = (totalRejectsFromData / totalItems) * 100;
        console.log('Total items (prod + rebuts):', totalItems);
        console.log('Taux de non-conformité:', rate.toFixed(2) + '%');
        console.log('=====================================');

        return rate;
    },

    // Filtrer les données de production selon les mêmes critères que les rebuts
    filterProductionData: function(data) {
        return data.filter(item => {
            if (!item.date || !item.machine) return false;

            // Filtrer uniquement les machines 850MS
            if (!item.machine.startsWith("850MS")) {
                return false;
            }

            // Filtrage par îlot
            if (this.currentFilters.ilot !== "all") {
                const ilotMachineNumbers = this.ilots[this.currentFilters.ilot] || [];
                const machineNum = String(item.machine.replace("850MS", ""));
                if (!ilotMachineNumbers.includes(machineNum)) {
                    return false;
                }
            }

            // Filtrage par machine
            if (this.currentFilters.machine !== "all" &&
                item.machine !== this.currentFilters.machine) {
                return false;
            }

            // Filtrage par référence
            if (this.currentFilters.material !== "all" &&
                item.material !== this.currentFilters.material) {
                return false;
            }

            // Filtrage par date
            const d = this.parseDate(item.date);
            const dStart = this.parseFrenchDate(this.currentFilters.startDate);
            const dEnd = this.parseFrenchDate(this.currentFilters.endDate);

            if (!d) return false;
            if (!dStart || !dEnd) return true;

            d.setHours(0, 0, 0, 0);
            dStart.setHours(0, 0, 0, 0);
            dEnd.setHours(23, 59, 59, 999);

            if (d < dStart || d > dEnd) return false;

            return true;
        });
    },

    // MACHINE COST TABLE
    displayMachineCostsTable: function (rejects) {
        const tbody = document.getElementById("machine-costs-table-body");
        if (!tbody) return;

        if (rejects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5">Aucun rebut trouvé</td></tr>`;
            return;
        }

        const machines = {};

        // Calculer le coût par machine : somme de (quantité × prix) par ligne
        rejects.forEach(r => {
            if (!machines[r.machine]) {
                machines[r.machine] = {
                    qty: 0,
                    cost: 0,
                    totalWeightedPrice: 0  // Pour calculer le prix moyen pondéré
                };
            }
            machines[r.machine].qty += r.scrapQuantity;
            const lineCost = r.scrapQuantity * r.unitPrice;
            machines[r.machine].cost += lineCost;
            machines[r.machine].totalWeightedPrice += lineCost;
        });

        // Calculer le prix unitaire moyen pondéré par quantité
        Object.keys(machines).forEach(machine => {
            const m = machines[machine];
            m.avgPrice = m.qty > 0 ? m.cost / m.qty : 0;
        });

        const totalCost = Object.values(machines).reduce((s, m) => s + m.cost, 0);

        let html = "";

        Object.keys(machines).sort((a, b) => machines[b].cost - machines[a].cost)
            .forEach(machine => {
                const m = machines[machine];
                const pct = totalCost > 0 ? (m.cost / totalCost) * 100 : 0;

                html += `
                <tr>
                    <td><b>${machine}</b></td>
                    <td>${m.qty}</td>
                    <td>${m.avgPrice.toFixed(5)}€</td>
                    <td>${m.cost.toFixed(2)}€</td>
                    <td>
                        <div class="percentage-bar">
                            <div class="percentage-fill" style="width:${pct}%;"></div>
                            <span>${pct.toFixed(1)}%</span>
                        </div>
                    </td>
                </tr>`;
            });

        tbody.innerHTML = html;
    },

    // DETAIL TABLE
    displayDetailedRejectsTable: function (rejects) {
        const tbody = document.getElementById("rejects-detail-table-body");

        if (!tbody) return;

        if (rejects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8">Aucun rebut</td></tr>`;
            return;
        }

        let html = "";

        rejects.sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(r => {
                const d = new Date(r.date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                const dateStr = `${day}/${month}/${year}`;

                html += `
                <tr>
                    <td>${dateStr}</td>
                    <td><b>${r.machine}</b></td>
                    <td>${r.material}</td>
                    <td>${r.description}</td>
                    <td>${r.scrapQuantity}</td>
                    <td>${r.unitPrice.toFixed(5)}€</td>
                    <td>${r.totalCost.toFixed(2)}€</td>
                    <td>Autre</td>
                </tr>`;
            });

        tbody.innerHTML = html;
    },

    // CHART (Évolution des pertes)
    renderRejectChart: function (rejects) {
        const canvas = document.getElementById("reject-cost-chart");
        if (!canvas) return;

        if (this.chart) {
            this.chart.destroy();
        }

        if (rejects.length === 0) {
            this.chart = new Chart(canvas, { type: "line", data: { labels: [], datasets: [] } });
            return;
        }

        // Si une machine spécifique est sélectionnée, grouper par référence (material)
        // Sinon, grouper par machine comme avant
        const isSpecificMachine = this.currentFilters.machine !== "all";

        const grouped = {};

        if (isSpecificMachine) {
            // Grouper par date et référence
            rejects.forEach(r => {
                if (!grouped[r.date]) grouped[r.date] = {};
                const key = r.material || "Sans référence";
                if (!grouped[r.date][key]) grouped[r.date][key] = 0;
                grouped[r.date][key] += r.totalCost;
            });

            const dates = Object.keys(grouped).sort();
            const materials = [...new Set(rejects.map(r => r.material || "Sans référence"))];

            const datasets = materials.map(material => ({
                label: material,
                data: dates.map(d => grouped[d][material] || 0),
                borderWidth: 2,
                fill: false
            }));

            this.chart = new Chart(canvas, {
                type: "line",
                data: {
                    labels: dates,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: {
                                font: { size: 11 }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Évolution des pertes par référence produit'
                        }
                    }
                }
            });
        } else {
            // Grouper par date et machine (comportement par défaut)
            rejects.forEach(r => {
                if (!grouped[r.date]) grouped[r.date] = {};
                if (!grouped[r.date][r.machine]) grouped[r.date][r.machine] = 0;
                grouped[r.date][r.machine] += r.totalCost;
            });

            const dates = Object.keys(grouped).sort();
            const machines = [...new Set(rejects.map(r => r.machine))];

            const datasets = machines.map(machine => ({
                label: machine,
                data: dates.map(d => grouped[d][machine] || 0),
                borderWidth: 2,
                fill: false
            }));

            this.chart = new Chart(canvas, {
                type: "line",
                data: {
                    labels: dates,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: {
                                font: { size: 11 }
                            }
                        }
                    }
                }
            });
        }
    }
};

// Auto-init
document.addEventListener("DOMContentLoaded", () => RejectAnalysis.init());
