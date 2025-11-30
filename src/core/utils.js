// ===========================================
// UTILITY FUNCTIONS MODULE
// ===========================================
const Utils = {
    // Debounce function for performance optimization
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format date to French locale
    formatDate: function(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    },

    // Get date range based on period
    getDateRange: function(period) {
        const today = new Date();
        const ranges = {
            today: () => {
                const start = new Date(today);
                start.setHours(0, 0, 0, 0);
                return { start, end: today };
            },
            week: () => {
                const start = new Date(today);
                start.setDate(today.getDate() - 7);
                return { start, end: today };
            },
            month: () => {
                const start = new Date(today);
                start.setMonth(today.getMonth() - 1);
                return { start, end: today };
            },
            year: () => {
                const start = new Date(today);
                start.setFullYear(today.getFullYear() - 1);
                return { start, end: today };
            },
            all: () => {
                return { start: new Date(0), end: today };
            }
        };
        return ranges[period] ? ranges[period]() : ranges.all();
    },

    // Filter results by period
    filterByPeriod: function(results, period) {
        if (period === 'all') return results;
        const { start, end } = this.getDateRange(period);
        return results.filter(result => {
            const resultDate = new Date(result.date);
            return resultDate >= start && resultDate <= end;
        });
    }
};
