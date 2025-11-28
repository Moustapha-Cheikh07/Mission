const AuthModule = {
    init: function() {
        this.setupAuthButton();

        // Listen for auth state changes
        window.addEventListener('authStateChanged', () => {
            this.updateAuthButton();
        });
    },

    setupAuthButton: function() {
        const authBtn = document.getElementById('auth-btn');
        if (!authBtn) return;

        this.updateAuthButton();

        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (SimpleAuth.isLoggedIn()) {
                if (UIModule.showConfirmation('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    SimpleAuth.logout();
                    this.updateAuthButton();
                    UIModule.showToast('Déconnecté avec succès', 'success');
                    window.location.reload();
                }
            } else {
                window.location.href = 'login.html';
            }
        });
    },

    updateAuthButton: function() {
        const authBtn = document.getElementById('auth-btn');
        if (!authBtn) return;

        if (SimpleAuth.isLoggedIn()) {
            const username = SimpleAuth.getCurrentUser();
            authBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i><span>Déconnecter (${username})</span>`;
            authBtn.setAttribute('aria-label', `Déconnecter ${username}`);
        } else {
            authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i><span>S\'identifier</span>';
            authBtn.setAttribute('aria-label', 'S\'identifier');
        }
    }
};

