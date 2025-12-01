const ActivityModule = {
    init: function() {
        this.displayActivities();
    },

    // Get relative time string in French
    getRelativeTime: function(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        return Utils.formatDate(timestamp);
    },

    // Display activities in the recent activity section
    displayActivities: function() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        const activities = DataManager.getActivities(5); // Get last 5 activities

        if (activities.length === 0) {
            activityList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Aucune activité récente</div>';
            return;
        }

        activityList.innerHTML = '';

        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description} - ${this.getRelativeTime(activity.timestamp)}</p>
                </div>
            `;

            activityList.appendChild(activityItem);
        });
    },

    // Add a new activity
    addActivity: function(activityData) {
        DataManager.addActivity(activityData);
        this.displayActivities(); // Refresh the display
    }
};
