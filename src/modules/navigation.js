// ===========================================
const NavigationModule = {
    init: function() {
        // Détecter si on est sur une page séparée (dashboard.html, documents.html, etc.)
        const isSeparatePage = window.location.pathname.includes('dashboard.html') ||
                               window.location.pathname.includes('documents.html') ||
                               window.location.pathname.includes('forms.html') ||
                               window.location.pathname.includes('training.html');

        // Si on est sur une page séparée, ne pas gérer la navigation par sections
        if (isSeparatePage) {
            console.log('📄 Page séparée détectée - Navigation module désactivé');
            this.setupQuickActionsForSeparatePages();
            return;
        }

        this.setupNavigation();
        this.setupQuickActions();
        this.setupHistoryNavigation();

        // Charger la section depuis l'URL au démarrage
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.showSection(hash, false);
    },

    setupNavigation: function() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = item.getAttribute('data-section');
                this.showSection(targetSection, true);
            });
        });
    },

    setupQuickActions: function() {
        const actionButtons = document.querySelectorAll('.action-btn-hover');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.getAttribute('data-section');
                if (targetSection) {
                    this.showSection(targetSection, true);
                }
            });
        });
    },

    setupHistoryNavigation: function() {
        // Écouter les changements d'historique (boutons retour/avancer du navigateur)
        window.addEventListener('popstate', (event) => {
            const hash = window.location.hash.slice(1) || 'dashboard';
            this.showSection(hash, false);
        });
    },

    showSection: function(sectionId, addToHistory = true) {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.content-section');

        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));

        const targetNav = document.querySelector(`[data-section="${sectionId}"]`);
        if (targetNav) targetNav.classList.add('active');

        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.add('active');

        // Ajouter à l'historique du navigateur
        if (addToHistory) {
            window.history.pushState({ section: sectionId }, '', `#${sectionId}`);
        }

        // Refresh chart when navigating to results
        if (sectionId === 'results') {
            setTimeout(() => ChartModule.init(), 100);
        }
    },

    setupQuickActionsForSeparatePages: function() {
        // Pour les pages séparées, les boutons "Actions rapides" doivent rediriger vers les pages HTML
        const actionButtons = document.querySelectorAll('.action-btn-hover');
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.getAttribute('data-section');
                if (targetSection) {
                    // Rediriger vers la page HTML correspondante
                    const pageMap = {
                        'dashboard': 'dashboard.html',
                        'documents': 'documents.html',
                        'forms': 'forms.html',
                        'training': 'training.html'
                    };
                    const targetPage = pageMap[targetSection];
                    if (targetPage) {
                        window.location.href = targetPage;
                    }
                }
            });
        });
    }
};
