const ResultsModule = {
    init: function() {
        this.generateTable();
        this.setupFilters();
        this.updateFilterSummary();
    },

    // Get all filtered results (synchronized with chart)
    getFilteredResults: function() {
        const allResults = DataManager.getResults();
        if (allResults.length === 0) return [];

        const lineFilter = document.getElementById('line-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const periodFilter = document.getElementById('period-filter')?.value || 'month';

        // Apply all filters (same logic as chart)
        let filtered = Utils.filterByPeriod(allResults, periodFilter);

        if (lineFilter !== 'all') {
            filtered = filtered.filter(r => r.line === lineFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        return filtered;
    },

    setupFilters: function() {
        const applyAllFilters = () => {
            this.generateTable();
            ChartModule.draw();
            this.updateFilterSummary();
        };

        // Period filter
        const periodFilter = document.getElementById('period-filter');
        if (periodFilter) {
            periodFilter.addEventListener('change', () => {
                applyAllFilters();
                const selectedText = periodFilter.options[periodFilter.selectedIndex].text;
                UIModule.showToast(`Filtre appliqué : ${selectedText}`, 'success');
            });
        }

        // Line filter
        const lineFilter = document.getElementById('line-filter');
        if (lineFilter) {
            lineFilter.addEventListener('change', () => {
                applyAllFilters();
                const selectedText = lineFilter.options[lineFilter.selectedIndex].text;
                UIModule.showToast(`Filtre appliqué : ${selectedText}`, 'success');
            });
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                applyAllFilters();
                const selectedText = statusFilter.options[statusFilter.selectedIndex].text;
                UIModule.showToast(`Filtre appliqué : ${selectedText}`, 'success');
            });
        }
    },

    // Update filter summary display
    updateFilterSummary: function() {
        const summaryElement = document.getElementById('filter-summary');
        if (!summaryElement) return;

        const lineFilter = document.getElementById('line-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const periodFilter = document.getElementById('period-filter')?.value || 'month';

        const results = this.getFilteredResults();
        const totalResults = DataManager.getResults().length;

        const periodNames = {
            'today': "Aujourd'hui",
            'week': 'Cette semaine',
            'month': 'Ce mois',
            'year': 'Cette année',
            'all': 'Toute la période'
        };

        const lineNames = {
            'all': 'Toutes les lignes',
            'A': 'Ligne A',
            'B': 'Ligne B',
            'C': 'Ligne C',
            'D': 'Ligne D'
        };

        const statusNames = {
            'all': 'Tous les statuts',
            'success': 'Conforme',
            'warning': 'À vérifier',
            'danger': 'Non-conforme'
        };

        let activeFilters = [];
        if (periodFilter !== 'all') activeFilters.push(periodNames[periodFilter]);
        if (lineFilter !== 'all') activeFilters.push(lineNames[lineFilter]);
        if (statusFilter !== 'all') activeFilters.push(statusNames[statusFilter]);

        const filterText = activeFilters.length > 0
            ? `Filtres actifs : ${activeFilters.join(' • ')}`
            : 'Aucun filtre actif';

        summaryElement.innerHTML = `
            <div class="filter-summary-content">
                <div class="filter-info">
                    <i class="fas fa-filter"></i>
                    <span>${filterText}</span>
                </div>
                <div class="results-count">
                    <strong>${results.length}</strong> résultat${results.length > 1 ? 's' : ''} sur ${totalResults}
                </div>
            </div>
        `;
    },

    generateTable: function() {
        const tableBody = document.getElementById('results-table-body');
        if (!tableBody) return;

        const results = this.getFilteredResults();

        tableBody.innerHTML = '';

        if (results.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);"><i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; opacity: 0.5;"></i>Aucun résultat ne correspond aux filtres sélectionnés</td></tr>';
            return;
        }

        const statusText = {
            'success': 'Conforme',
            'warning': 'À vérifier',
            'danger': 'Non-conforme'
        };

        const statusClass = {
            'success': 'success',
            'warning': 'warning',
            'danger': 'danger'
        };

        results.forEach(data => {
            const row = document.createElement('tr');
            const formattedDate = Utils.formatDate(data.date);

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>Ligne ${data.line}</td>
                <td>${data.reference}</td>
                <td><span class="status-badge ${statusClass[data.status]}">${statusText[data.status]}</span></td>
                <td>${data.operator}</td>
            `;

            tableBody.appendChild(row);
        });
    }
};
