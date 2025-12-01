// ===========================================
const ChartModule = {
    canvas: null,
    ctx: null,
    data: null,
    padding: 50,
    dimensions: { width: 0, height: 0, stepX: 0, stepY: 0 },
    range: { min: 0, max: 100 },
    hoveredIndex: -1,
    tooltip: null,

    // Initialize chart
    init: function() {
        this.canvas = document.getElementById('conformity-chart');
        if (!this.canvas) return;

        this.tooltip = document.getElementById('chart-tooltip');

        // Set canvas dimensions
        this.canvas.width = 1000;
        this.canvas.height = 500;
        this.ctx = this.canvas.getContext('2d');

        this.setupEventListeners();
        this.draw();
    },

    // Setup all event listeners with debouncing
    setupEventListeners: function() {
        if (!this.canvas) return;

        const debouncedMouseMove = Utils.debounce((e) => this.handleMouseMove(e), 16);

        this.canvas.addEventListener('mousemove', debouncedMouseMove);
        this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    },

    // Get filtered data based on current filters
    getFilteredData: function() {
        const results = DataManager.getResults();
        if (results.length === 0) return null;

        const lineFilter = document.getElementById('line-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const periodFilter = document.getElementById('period-filter')?.value || 'month';

        // Apply all filters
        let filtered = Utils.filterByPeriod(results, periodFilter);

        if (lineFilter !== 'all') {
            filtered = filtered.filter(r => r.line === lineFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Group by date and calculate conformity rate
        const dateGroups = {};
        filtered.forEach(result => {
            const date = result.date;
            if (!dateGroups[date]) {
                dateGroups[date] = { total: 0, conform: 0 };
            }
            dateGroups[date].total++;
            if (result.status === 'success') {
                dateGroups[date].conform++;
            }
        });

        // Convert to array and sort
        const chartData = Object.keys(dateGroups)
            .sort((a, b) => new Date(a) - new Date(b))
            .map(date => ({
                date: date,
                rate: (dateGroups[date].conform / dateGroups[date].total) * 100
            }));

        // Take last 10 points
        const lastPoints = chartData.slice(-10);

        return {
            dates: lastPoints.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
            }),
            rates: lastPoints.map(d => d.rate),
            fullDates: lastPoints.map(d => d.date)
        };
    },

    // Main draw function
    draw: function(highlightIndex = -1) {
        if (!this.ctx || !this.canvas) return;

        // Check if canvas is visible
        if (this.canvas.offsetWidth === 0) {
            setTimeout(() => this.draw(), 100);
            return;
        }

        this.data = this.getFilteredData();

        if (!this.data || this.data.rates.length === 0) {
            this.drawNoData();
            return;
        }

        this.calculateDimensions();
        this.clearCanvas();
        this.drawGrid();
        this.drawAxes();
        this.drawAreaGradient();
        this.drawLine();
        this.drawPoints(highlightIndex);
        this.drawLabels();
        this.drawLegend();
    },

    // Calculate chart dimensions
    calculateDimensions: function() {
        const rates = this.data.rates;
        const minDataValue = Math.min(...rates);
        const maxDataValue = Math.max(...rates);

        this.range.min = Math.max(0, Math.floor(minDataValue - 5));
        this.range.max = Math.min(100, Math.ceil(maxDataValue + 5));

        this.dimensions.width = this.canvas.width - (this.padding * 2);
        this.dimensions.height = this.canvas.height - (this.padding * 2);
        this.dimensions.stepX = rates.length > 1 ? this.dimensions.width / (rates.length - 1) : this.dimensions.width / 2;
        this.dimensions.stepY = this.dimensions.height / (this.range.max - this.range.min);
    },

    // Clear canvas
    clearCanvas: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // Draw background grid
    drawGrid: function() {
        this.ctx.strokeStyle = '#f1f5f9';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = this.padding + (this.dimensions.height / 5) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(this.canvas.width - this.padding, y);
            this.ctx.stroke();
        }
    },

    // Draw axes
    drawAxes: function() {
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding);
        this.ctx.lineTo(this.padding, this.canvas.height - this.padding);
        this.ctx.lineTo(this.canvas.width - this.padding, this.canvas.height - this.padding);
        this.ctx.stroke();
    },

    // Draw gradient area under line
    drawAreaGradient: function() {
        const gradient = this.ctx.createLinearGradient(0, this.padding, 0, this.canvas.height - this.padding);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.canvas.height - this.padding);

        this.data.rates.forEach((value, index) => {
            const x = this.padding + (this.dimensions.stepX * index);
            const y = this.canvas.height - this.padding - ((value - this.range.min) * this.dimensions.stepY);
            this.ctx.lineTo(x, y);
        });

        this.ctx.lineTo(this.padding + (this.dimensions.stepX * (this.data.rates.length - 1)),
                       this.canvas.height - this.padding);
        this.ctx.closePath();
        this.ctx.fill();
    },

    // Draw main line
    drawLine: function() {
        this.ctx.strokeStyle = '#10b981';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();

        this.data.rates.forEach((value, index) => {
            const x = this.padding + (this.dimensions.stepX * index);
            const y = this.canvas.height - this.padding - ((value - this.range.min) * this.dimensions.stepY);
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.stroke();
    },

    // Draw data points
    drawPoints: function(highlightIndex) {
        this.data.rates.forEach((value, index) => {
            const x = this.padding + (this.dimensions.stepX * index);
            const y = this.canvas.height - this.padding - ((value - this.range.min) * this.dimensions.stepY);

            const isHighlighted = index === highlightIndex;

            // Draw point
            this.ctx.fillStyle = isHighlighted ? '#059669' : '#10b981';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;

            this.ctx.beginPath();
            this.ctx.arc(x, y, isHighlighted ? 8 : 6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Draw value label for highlighted point
            if (isHighlighted || this.data.rates.length <= 5) {
                this.ctx.fillStyle = '#059669';
                this.ctx.font = 'bold 11px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(value.toFixed(1) + '%', x, y - 12);
            }
        });
    },

    // Draw axis labels
    drawLabels: function() {
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = 'bold 14px sans-serif';

        // X-axis labels (dates)
        this.ctx.textAlign = 'center';
        this.data.dates.forEach((label, index) => {
            const x = this.padding + (this.dimensions.stepX * index);
            this.ctx.fillText(label, x, this.canvas.height - this.padding + 25);
        });

        // Y-axis labels (percentages)
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        for (let i = 0; i <= 5; i++) {
            const value = this.range.min + ((this.range.max - this.range.min) / 5) * (5 - i);
            const y = this.padding + (this.dimensions.height / 5) * i;
            this.ctx.fillText(value.toFixed(0) + '%', this.padding - 10, y);
        }
    },

    // Draw professional legend with statistics
    drawLegend: function() {
        const rates = this.data.rates;
        const avgRate = (rates.reduce((sum, val) => sum + val, 0) / rates.length).toFixed(1);
        const maxRate = Math.max(...rates).toFixed(1);
        const minRate = Math.min(...rates).toFixed(1);

        // Get active filters
        const lineFilter = document.getElementById('line-filter')?.value || 'all';
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const periodFilter = document.getElementById('period-filter')?.value || 'month';

        const periodNames = {
            'today': "Aujourd'hui",
            'week': 'Semaine',
            'month': 'Mois',
            'year': 'Année',
            'all': 'Tout'
        };

        const lineNames = {
            'all': 'Toutes lignes',
            'A': 'Ligne A',
            'B': 'Ligne B',
            'C': 'Ligne C',
            'D': 'Ligne D'
        };

        const statusNames = {
            'all': 'Tous statuts',
            'success': 'Conforme',
            'warning': 'À vérifier',
            'danger': 'Non-conforme'
        };

        // Draw title with filters
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Évolution du Taux de Conformité', this.padding, this.padding - 30);

        // Draw filter info
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '11px sans-serif';
        let filterText = `${periodNames[periodFilter]}`;
        if (lineFilter !== 'all') filterText += ` • ${lineNames[lineFilter]}`;
        if (statusFilter !== 'all') filterText += ` • ${statusNames[statusFilter]}`;
        this.ctx.fillText(filterText, this.padding, this.padding - 12);

        // Draw statistics box
        const statsX = this.canvas.width - this.padding - 200;
        const statsY = this.padding - 35;
        const statsWidth = 200;
        const statsHeight = 70;

        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(statsX, statsY, statsWidth, statsHeight);
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(statsX, statsY, statsWidth, statsHeight);

        // Statistics text
        const stats = [
            { label: 'Moyenne', value: avgRate + '%', color: '#10b981' },
            { label: 'Maximum', value: maxRate + '%', color: '#3b82f6' },
            { label: 'Minimum', value: minRate + '%', color: '#f59e0b' }
        ];

        stats.forEach((stat, index) => {
            const y = statsY + 20 + (index * 16);

            // Label
            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '10px sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(stat.label + ':', statsX + 10, y);

            // Value
            this.ctx.fillStyle = stat.color;
            this.ctx.font = 'bold 12px sans-serif';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(stat.value, statsX + statsWidth - 10, y);
        });
    },

    // Draw "no data" message
    drawNoData: function() {
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Aucune donnée disponible', this.canvas.width / 2, this.canvas.height / 2);
    },

    // Handle mouse move
    handleMouseMove: function(e) {
        if (!this.data) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find closest data point
        let closestIndex = -1;
        let minDistance = Infinity;

        this.data.rates.forEach((value, index) => {
            const pointX = this.padding + (this.dimensions.stepX * index);
            const pointY = this.canvas.height - this.padding - ((value - this.range.min) * this.dimensions.stepY);
            const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2);

            if (distance < minDistance && distance < 20) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== this.hoveredIndex) {
            this.hoveredIndex = closestIndex;
            this.draw(this.hoveredIndex);

            if (this.hoveredIndex >= 0 && this.tooltip) {
                const value = this.data.rates[this.hoveredIndex];
                const date = this.data.fullDates[this.hoveredIndex];
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                const formattedDate = `${day}/${month}/${year}`;

                this.tooltip.textContent = `${formattedDate}: ${value.toFixed(1)}%`;
                this.tooltip.style.left = (e.clientX + 10) + 'px';
                this.tooltip.style.top = (e.clientY - 10) + 'px';
                this.tooltip.classList.add('show');
            } else if (this.tooltip) {
                this.tooltip.classList.remove('show');
            }
        }
    },

    // Handle mouse leave
    handleMouseLeave: function() {
        this.hoveredIndex = -1;
        this.draw(-1);
        if (this.tooltip) {
            this.tooltip.classList.remove('show');
        }
    },

    // Handle click on data point
    handleClick: function(e) {
        if (this.hoveredIndex >= 0 && this.data) {
            const date = this.data.fullDates[this.hoveredIndex];
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const formattedDate = `${day}/${month}/${year}`;
            UIModule.showToast(`Données du ${formattedDate} sélectionnées`, 'success');
        }
    }
};
