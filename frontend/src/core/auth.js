// Simple Authentication System
// NOTE: This is a demo authentication system for training purposes
// In production, use server-side authentication with proper security
const SimpleAuth = {
    // Storage keys
    STORAGE_KEY: 'mg_logged_in',
    SESSION_KEY: 'mg_session_id',
    USERNAME_KEY: 'mg_username',

    // Simple password hashing function (for demo only - use bcrypt in production)
    hashPassword: function(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    },

    // Admin users (hashed passwords)
    ADMIN_USERS: [],

    // Initialize auth system
    init: function() {
        // Initialize admin users with hashed passwords
        this.ADMIN_USERS = [
            {
                username: 'l.lalot',
                passwordHash: this.hashPassword('Lalot2025!'),
                fullName: 'LALOT Ludovic',
                role: 'admin'
            },
            {
                username: 'a.boulenger',
                passwordHash: this.hashPassword('Boulenger2025!'),
                fullName: 'BOULENGER Antoine',
                role: 'admin'
            },
            {
                username: 'admin',
                passwordHash: this.hashPassword('admin'),
                fullName: 'admin',
                role: 'admin'
            },
        ];
        // Check session expiration (24 hours)
        this.checkSessionExpiration();
    },

    // Check if session has expired
    checkSessionExpiration: function() {
        try {
            const sessionTime = localStorage.getItem('mg_session_time');
            if (sessionTime) {
                const now = new Date().getTime();
                const sessionAge = now - parseInt(sessionTime);
                // Session expires after 24 hours (86400000 ms)
                if (sessionAge > 86400000) {
                    this.logout();
                }
            }
        } catch (e) {
            console.error('Error checking session:', e);
        }
    },

    // Generate simple session ID
    generateSessionId: function() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    },

    // Login function with improved security
    login: function(username, password) {
        try {
            // Validate inputs
            if (!username || !password) {
                return { success: false, message: 'Veuillez remplir tous les champs' };
            }

            // Hash the provided password
            const hashedPassword = this.hashPassword(password);

            // Find user in admin users list
            const user = this.ADMIN_USERS.find(u => u.username === username);

            // Check credentials
            if (user && hashedPassword === user.passwordHash) {
                const sessionId = this.generateSessionId();
                localStorage.setItem(this.STORAGE_KEY, 'true');
                localStorage.setItem(this.SESSION_KEY, sessionId);
                localStorage.setItem(this.USERNAME_KEY, user.fullName || username);
                localStorage.setItem('mg_user_role', user.role);
                localStorage.setItem('mg_session_time', new Date().getTime().toString());

                // Dispatch auth changed event
                window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: true } }));

                return { success: true, message: 'Connexion réussie' };
            }
            return { success: false, message: 'Identifiant ou mot de passe incorrect' };
        } catch (e) {
            console.error('Login error:', e);
            return { success: false, message: 'Erreur lors de la connexion' };
        }
    },

    // Logout function
    logout: function() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.SESSION_KEY);
            localStorage.removeItem(this.USERNAME_KEY);
            localStorage.removeItem('mg_user_role');
            localStorage.removeItem('mg_session_time');

            // Dispatch auth changed event
            window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: false } }));
        } catch (e) {
            console.error('Logout error:', e);
        }
    },

    // Check if user is logged in
    isLoggedIn: function() {
        try {
            this.checkSessionExpiration();
            return localStorage.getItem(this.STORAGE_KEY) === 'true' &&
                   localStorage.getItem(this.SESSION_KEY) !== null;
        } catch (e) {
            console.error('Error checking login status:', e);
            return false;
        }
    },

    // Get current username
    getCurrentUser: function() {
        try {
            return localStorage.getItem(this.USERNAME_KEY) || 'Utilisateur';
        } catch (e) {
            return 'Utilisateur';
        }
    },

    // Get current user role
    getUserRole: function() {
        try {
            return localStorage.getItem('mg_user_role') || 'user';
        } catch (e) {
            return 'user';
        }
    },

    // Check if current user is admin
    isAdmin: function() {
        return this.getUserRole() === 'admin';
    }
};

// Initialize auth system when script loads
if (typeof SimpleAuth.hashPassword === 'function') {
    SimpleAuth.init();
}
