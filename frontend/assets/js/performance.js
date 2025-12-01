/**
 * Performance Optimizations & Enhancements
 * Améliore les performances et l'expérience utilisateur
 */

const PerformanceOptimizer = {
    /**
     * Initialise toutes les optimisations
     */
    init: function() {
        this.setupLazyLoading();
        this.setupScrollAnimations();
        this.setupImageOptimization();
        this.setupDebouncing();
        this.setupCaching();
        console.log('✅ Performance optimizations loaded');
    },

    /**
     * Lazy Loading pour les images
     */
    setupLazyLoading: function() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[data-src]');

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    },

    /**
     * Animations au scroll
     */
    setupScrollAnimations: function() {
        if ('IntersectionObserver' in window) {
            const elementsToAnimate = document.querySelectorAll('.fade-in-on-scroll, .card, .stat-card');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            elementsToAnimate.forEach(el => {
                observer.observe(el);
            });
        }
    },

    /**
     * Optimisation des images
     */
    setupImageOptimization: function() {
        // Convertir les images en WebP si supporté
        if (this.supportsWebP()) {
            document.querySelectorAll('img').forEach(img => {
                if (img.src && !img.src.endsWith('.webp')) {
                    const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    const testImg = new Image();
                    testImg.onerror = () => {
                        // Garder l'image originale si WebP n'existe pas
                    };
                    testImg.onload = () => {
                        img.src = webpSrc;
                    };
                    testImg.src = webpSrc;
                }
            });
        }
    },

    /**
     * Vérifie le support WebP
     */
    supportsWebP: function() {
        const elem = document.createElement('canvas');
        if (elem.getContext && elem.getContext('2d')) {
            return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        }
        return false;
    },

    /**
     * Debouncing pour les événements fréquents
     */
    setupDebouncing: function() {
        // Debounce pour les inputs de recherche
        const searchInputs = document.querySelectorAll('input[type="search"], input[type="text"][placeholder*="Rechercher"], input[placeholder*="rechercher"]');

        searchInputs.forEach(input => {
            let timeout;
            const originalHandler = input.oninput;

            input.oninput = function(e) {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (originalHandler) originalHandler.call(this, e);
                }, 300);
            };
        });

        // Debounce pour le resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                window.dispatchEvent(new Event('optimizedResize'));
            }, 250);
        });
    },

    /**
     * Système de cache simple
     */
    setupCaching: function() {
        // Cache pour les requêtes réseau
        const cache = new Map();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        window.fetchWithCache = async function(url, options = {}) {
            const cacheKey = url + JSON.stringify(options);
            const cached = cache.get(cacheKey);

            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.data;
            }

            const data = await fetch(url, options).then(r => r.json());
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        };

        // Nettoyer le cache périodiquement
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of cache.entries()) {
                if (now - value.timestamp > CACHE_DURATION) {
                    cache.delete(key);
                }
            }
        }, CACHE_DURATION);
    },

    /**
     * Fonction utilitaire de debounce
     */
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

    /**
     * Fonction utilitaire de throttle
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * Animations d'entrée pour les nouveaux éléments
 */
const AnimationManager = {
    /**
     * Anime l'apparition d'un élément
     */
    fadeIn: function(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },

    /**
     * Anime la disparition d'un élément
     */
    fadeOut: function(element, duration = 300) {
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    },

    /**
     * Anime l'apparition avec scale
     */
    scaleIn: function(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.95)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        });
    },

    /**
     * Ajoute une classe avec animation
     */
    animateClass: function(element, className, duration = 300) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
};

/**
 * Gestion des nombres animés
 */
const NumberAnimator = {
    /**
     * Anime un nombre de 0 à sa valeur finale
     */
    animateValue: function(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16); // 60fps
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current).toLocaleString('fr-FR');
        }, 16);
    },

    /**
     * Anime tous les éléments avec la classe .animate-number
     */
    animateAll: function() {
        const elements = document.querySelectorAll('.animate-number');
        elements.forEach(el => {
            const finalValue = parseInt(el.textContent.replace(/\s/g, ''));
            if (!isNaN(finalValue)) {
                this.animateValue(el, 0, finalValue, 1500);
            }
        });
    }
};

// Initialiser au chargement du DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PerformanceOptimizer.init();
    });
} else {
    PerformanceOptimizer.init();
}

// Export pour utilisation globale
window.PerformanceOptimizer = PerformanceOptimizer;
window.AnimationManager = AnimationManager;
window.NumberAnimator = NumberAnimator;
