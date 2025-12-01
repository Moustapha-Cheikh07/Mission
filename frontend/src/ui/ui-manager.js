// ===========================================
const UIModule = {
    // Show toast notification
    showToast: function(message, type = 'success') {
        const toast = document.getElementById('message-toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    // Show confirmation dialog
    showConfirmation: function(message) {
        return confirm(message);
    },

    // Update date display
    updateDateDisplay: function() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const today = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            dateElement.textContent = today.toLocaleDateString('fr-FR', options);
        }
    },

    // Update dashboard statistics
    updateStats: function() {
        const stats = DataManager.getStats();
        const statCards = document.querySelectorAll('.stat-card');

        if (statCards.length >= 4) {
            const updates = [
                stats.conformityRate + '%',
                stats.totalControls.toLocaleString(),
                stats.nonConformControls,
                stats.totalDocuments
            ];

            statCards.forEach((card, index) => {
                const h3 = card.querySelector('.stat-info h3');
                if (h3 && updates[index] !== undefined) {
                    h3.textContent = updates[index];
                }
            });
        }
    }
};
