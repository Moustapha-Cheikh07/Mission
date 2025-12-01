// Fiche Étoile Module - Déclaration de Non-Conformité Production
const FicheEtoileModule = {
    fiches: [],
    references850MS: [],
    currentReference: null,
    currentNumeroNNCP: null,
    API_URL: 'http://localhost:3000/api/fiches-etoile',
    REFERENCES_URL: 'http://localhost:3000/api/references/850ms',
    CACHE_KEY: 'references_850ms_cache',
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 heures en millisecondes

    init: function() {
        console.log('✨ Fiche Étoile module initializing (NNCP)...');
        this.load850MSReferences();
        this.loadNextNumeroNNCP();
        this.setupEventListeners();
        this.loadFichesFromServer();
    },

    /**
     * Charger toutes les références 850MS depuis l'Excel avec système de cache
     */
    load850MSReferences: async function() {
        // Afficher un indicateur de chargement dans le select
        const select = document.getElementById('fiche-reference');
        if (select) {
            select.innerHTML = '<option value="">⏳ Chargement des références...</option>';
            select.disabled = true;
        }

        try {
            // Vérifier d'abord le cache localStorage
            const cached = this.getCachedReferences();
            if (cached) {
                console.log(`✅ ${cached.length} références 850MS chargées depuis le cache`);
                this.references850MS = cached;
                this.populateReferenceSelect();
                if (select) select.disabled = false;
                return;
            }

            // Si pas de cache, charger depuis le serveur
            console.log('📡 Chargement des références depuis le serveur...');
            const response = await fetch(this.REFERENCES_URL);
            const result = await response.json();

            if (result.success && result.data) {
                this.references850MS = result.data;
                // Sauvegarder dans le cache
                this.setCachedReferences(result.data);
                this.populateReferenceSelect();
                console.log(`✅ ${result.count} références 850MS chargées et mises en cache`);
            } else {
                console.error('❌ Erreur lors du chargement des références:', result.error);
                this.showError('Impossible de charger les références 850MS');
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            this.showError('Erreur de connexion au serveur');
        } finally {
            if (select) select.disabled = false;
        }
    },

    /**
     * Récupérer les références depuis le cache localStorage
     */
    getCachedReferences: function() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();

            // Vérifier si le cache est encore valide (moins de 24h)
            if (data.timestamp && (now - data.timestamp < this.CACHE_DURATION)) {
                return data.references;
            }

            // Cache expiré, le supprimer
            localStorage.removeItem(this.CACHE_KEY);
            return null;
        } catch (error) {
            console.error('Erreur lecture cache:', error);
            return null;
        }
    },

    /**
     * Sauvegarder les références dans le cache localStorage
     */
    setCachedReferences: function(references) {
        try {
            const data = {
                timestamp: Date.now(),
                references: references
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Erreur sauvegarde cache:', error);
        }
    },

    /**
     * Remplir le select avec les références 850MS
     */
    populateReferenceSelect: function() {
        const select = document.getElementById('fiche-reference');
        if (!select) return;

        // Vider le select (garder juste la première option)
        select.innerHTML = '<option value="">Sélectionner une référence 850MS...</option>';

        // Ajouter toutes les références
        this.references850MS.forEach(ref => {
            const option = document.createElement('option');
            option.value = ref.reference;
            option.textContent = `${ref.reference} - ${ref.libelle}`;
            option.dataset.libelle = ref.libelle;
            option.dataset.prixUnitaire = ref.prix_unitaire;
            select.appendChild(option);
        });
    },

    /**
     * Charger le prochain numéro NNCP disponible
     */
    loadNextNumeroNNCP: async function() {
        try {
            const response = await fetch(`${this.API_URL}/generate-numero`);
            const result = await response.json();

            if (result.success && result.numero_nncp) {
                this.currentNumeroNNCP = result.numero_nncp;
                const span = document.getElementById('current-numero-nncp');
                if (span) {
                    span.textContent = this.currentNumeroNNCP;
                }
                console.log(`📋 Numéro NNCP généré: ${this.currentNumeroNNCP}`);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la génération du numéro NNCP:', error);
            const span = document.getElementById('current-numero-nncp');
            if (span) {
                span.textContent = 'Erreur';
            }
        }
    },

    setupEventListeners: function() {
        // Changement de référence
        const refSelect = document.getElementById('fiche-reference');
        if (refSelect) {
            refSelect.addEventListener('change', () => this.onReferenceChange());
        }

        // Changement de quantité
        const quantiteInput = document.getElementById('fiche-quantite');
        if (quantiteInput) {
            quantiteInput.addEventListener('input', () => this.calculatePrixTotal());
        }

        // Preview button
        const previewBtn = document.getElementById('preview-fiche-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.showPreview());
        }

        // Print button
        const printBtn = document.getElementById('print-nncp-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printPreview());
        }

        // Confirm submit button
        const confirmBtn = document.getElementById('confirm-submit-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.submitFiche());
        }

        // Reset button
        const resetBtn = document.getElementById('reset-fiche-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetForm());
        }

        // Search fiches
        const searchInput = document.getElementById('fiches-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterFiches(e.target.value);
            });
        }
    },

    /**
     * Quand l'utilisateur sélectionne une référence
     */
    onReferenceChange: function() {
        const select = document.getElementById('fiche-reference');
        const selectedOption = select.options[select.selectedIndex];

        if (select.value && selectedOption.dataset.libelle) {
            // Remplir automatiquement le libellé
            const libelleInput = document.getElementById('fiche-libelle');
            if (libelleInput) {
                libelleInput.value = selectedOption.dataset.libelle;
            }

            // Stocker la référence courante avec son prix
            this.currentReference = {
                reference: select.value,
                libelle: selectedOption.dataset.libelle,
                prix_unitaire: parseFloat(selectedOption.dataset.prixUnitaire) || 0
            };

            // Calculer le prix total si quantité déjà saisie
            this.calculatePrixTotal();
        } else {
            // Vider les champs
            const libelleInput = document.getElementById('fiche-libelle');
            if (libelleInput) {
                libelleInput.value = '';
            }
            this.currentReference = null;
            this.calculatePrixTotal();
        }
    },

    /**
     * Calculer le prix total automatiquement
     */
    calculatePrixTotal: function() {
        const quantiteInput = document.getElementById('fiche-quantite');
        const prixTotalInput = document.getElementById('fiche-prix-total');

        if (!quantiteInput || !prixTotalInput) return;

        const quantite = parseInt(quantiteInput.value) || 0;

        if (this.currentReference && quantite > 0) {
            const prixTotal = quantite * this.currentReference.prix_unitaire;
            prixTotalInput.value = `${prixTotal.toFixed(2)} €`;
        } else {
            prixTotalInput.value = '';
        }
    },

    /**
     * Afficher la prévisualisation
     */
    showPreview: function() {
        // Récupérer les données du formulaire
        const reference = document.getElementById('fiche-reference').value;
        const libelle = document.getElementById('fiche-libelle').value;
        const quantite = parseInt(document.getElementById('fiche-quantite').value);
        const dateProduction = document.getElementById('fiche-date-production').value;
        const operateur = document.getElementById('fiche-operateur').value || 'Non spécifié';
        const probleme = document.getElementById('fiche-probleme').value || 'Non spécifié';
        const decision49ms = document.getElementById('fiche-decision-49ms').checked;

        // Validation
        if (!reference || !libelle || !quantite || !dateProduction) {
            this.showError('Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        if (!this.currentReference) {
            this.showError('Référence invalide');
            return;
        }

        // Calculer le prix total
        const prixTotal = (quantite * this.currentReference.prix_unitaire).toFixed(2);

        // Générer le HTML de prévisualisation
        const previewHTML = `
            <div id="printable-nncp" class="p-4">
                <div class="text-center mb-4">
                    <h3 class="fw-bold text-warning">⚠️ DÉCLARATION DE NON-CONFORMITÉ PRODUCTION</h3>
                    <h4 class="text-primary">${this.currentNumeroNNCP}</h4>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-light">
                                <h6 class="mb-0"><i class="bi bi-building me-2"></i>Zone Production</h6>
                            </div>
                            <div class="card-body">
                                <table class="table table-sm">
                                    <tr>
                                        <th style="width: 40%;">Référence:</th>
                                        <td><strong>${reference}</strong></td>
                                    </tr>
                                    <tr>
                                        <th>Libellé:</th>
                                        <td>${libelle}</td>
                                    </tr>
                                    <tr>
                                        <th>Quantité:</th>
                                        <td><strong>${quantite}</strong></td>
                                    </tr>
                                    <tr>
                                        <th>Prix unitaire:</th>
                                        <td>${this.currentReference.prix_unitaire.toFixed(5)} €</td>
                                    </tr>
                                    <tr>
                                        <th>Prix total:</th>
                                        <td><strong class="text-success">${prixTotal} €</strong></td>
                                    </tr>
                                    <tr>
                                        <th>Date de production:</th>
                                        <td>${new Date(dateProduction).toLocaleDateString('fr-FR')}</td>
                                    </tr>
                                    <tr>
                                        <th>Opérateur:</th>
                                        <td>${operateur}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-header bg-success bg-opacity-10">
                                <h6 class="mb-0"><i class="bi bi-check-circle me-2"></i>Décision Qualité</h6>
                            </div>
                            <div class="card-body d-flex flex-column justify-content-center">
                                <div class="text-center mb-3">
                                    <div class="form-check form-switch d-inline-block" style="font-size: 1.5rem;">
                                        <input class="form-check-input" type="checkbox" ${decision49ms ? 'checked' : ''} disabled>
                                        <label class="form-check-label ms-2 fw-bold">49MS</label>
                                    </div>
                                </div>
                                <div class="alert ${decision49ms ? 'alert-success' : 'alert-warning'} mb-0">
                                    <strong>Statut:</strong> ${decision49ms ? 'Approuvé pour 49MS' : 'En attente de décision'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header bg-light">
                        <h6 class="mb-0"><i class="bi bi-exclamation-circle me-2"></i>Description du Problème</h6>
                    </div>
                    <div class="card-body">
                        <p class="mb-0">${probleme}</p>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-top text-muted small">
                    <p class="mb-0">Document généré le ${new Date().toLocaleString('fr-FR')}</p>
                </div>
            </div>
        `;

        // Afficher dans la modal
        document.getElementById('preview-nncp-body').innerHTML = previewHTML;

        // Ouvrir la modal
        const modal = new bootstrap.Modal(document.getElementById('preview-nncp-modal'));
        modal.show();
    },

    /**
     * Imprimer la prévisualisation
     */
    printPreview: function() {
        const printContent = document.getElementById('printable-nncp').innerHTML;
        const originalContent = document.body.innerHTML;

        // Créer une fenêtre d'impression temporaire
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fiche NNCP - ${this.currentNumeroNNCP}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
                <style>
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
            </body>
            </html>
        `);
        printWindow.document.close();

        // Attendre que le contenu soit chargé puis imprimer
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    },

    /**
     * Soumettre la fiche
     */
    submitFiche: async function() {
        // Récupérer les données du formulaire
        const reference = document.getElementById('fiche-reference').value;
        const libelle = document.getElementById('fiche-libelle').value;
        const quantite = parseInt(document.getElementById('fiche-quantite').value);
        const dateProduction = document.getElementById('fiche-date-production').value;
        const operateur = document.getElementById('fiche-operateur').value || 'Non spécifié';
        const probleme = document.getElementById('fiche-probleme').value || 'Non spécifié';
        const decision49ms = document.getElementById('fiche-decision-49ms').checked;

        // Validation
        if (!reference || !libelle || !quantite || !dateProduction) {
            this.showError('Veuillez remplir tous les champs obligatoires (*) '          );
            return;
        }

        if (!this.currentReference) {
            this.showError('Référence invalide');
            return;
        }

        // Préparer les données
        const ficheData = {
            numero_nncp: this.currentNumeroNNCP,
            reference: reference,
            libelle: libelle,
            quantite: quantite,
            prix_unitaire: this.currentReference.prix_unitaire,
            date_production: dateProduction,
            operateur: operateur,
            probleme: probleme,
            decision_49ms: decision49ms,
            status: 'pending'
        };

        console.log('📤 Envoi de la fiche:', ficheData);

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ficheData)
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Fiche créée avec succès:', result.numero_nncp);

                // Fermer la modal de prévisualisation si elle est ouverte
                const modal = bootstrap.Modal.getInstance(document.getElementById('preview-nncp-modal'));
                if (modal) {
                    modal.hide();
                }

                this.showSuccess(`Fiche ${result.numero_nncp} créée avec succès!`);
                this.resetForm();
                this.loadNextNumeroNNCP(); // Charger le prochain numéro
                this.loadFichesFromServer(); // Rafraîchir la liste
            } else {
                this.showError('Erreur lors de la création: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            this.showError('Erreur de connexion au serveur');
        }
    },

    /**
     * Réinitialiser le formulaire
     */
    resetForm: function() {
        document.getElementById('fiche-etoile-form').reset();
        document.getElementById('fiche-libelle').value = '';
        document.getElementById('fiche-prix-total').value = '';
        document.getElementById('fiche-decision-49ms').checked = false;
        this.currentReference = null;
        this.hideError();
    },

    /**
     * Charger les fiches depuis le serveur
     */
    loadFichesFromServer: async function() {
        try {
            const response = await fetch(this.API_URL);
            const result = await response.json();

            if (result.success && result.data) {
                this.fiches = result.data;
                this.displayFiches();
                console.log(`✅ ${this.fiches.length} fiches chargées`);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des fiches:', error);
        }
    },

    /**
     * Afficher les fiches dans la liste
     */
    displayFiches: function() {
        const container = document.getElementById('fiches-list');
        if (!container) return;

        if (this.fiches.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">Aucune fiche enregistrée</p>';
            return;
        }

        container.innerHTML = this.fiches.map(fiche => `
            <div class="card mb-3 fiche-card" data-fiche-id="${fiche.id}" style="cursor: pointer;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">
                                <span class="badge bg-primary">${fiche.numero_nncp}</span>
                                ${fiche.reference}
                            </h6>
                            <p class="text-muted small mb-1">${fiche.libelle}</p>
                        </div>
                        <span class="badge ${this.getStatusBadgeClass(fiche.status)}">
                            ${this.getStatusLabel(fiche.status)}
                        </span>
                    </div>
                    <div class="row g-2 small">
                        <div class="col-md-3">
                            <strong>Quantité:</strong> ${fiche.quantite}
                        </div>
                        <div class="col-md-3">
                            <strong>Prix:</strong> ${fiche.prix_total} €
                        </div>
                        <div class="col-md-3">
                            <strong>Date:</strong> ${new Date(fiche.date_production).toLocaleDateString('fr-FR')}
                        </div>
                        <div class="col-md-3">
                            <strong>49MS:</strong> ${fiche.decision_49ms ? '✅ Oui' : '❌ Non'}
                        </div>
                    </div>
                    ${fiche.probleme !== 'Non spécifié' ? `
                    <div class="mt-2 small">
                        <strong>Problème:</strong> ${fiche.probleme}
                    </div>
                    ` : ''}
                    <div class="mt-2 text-end">
                        <small class="text-muted"><i class="bi bi-mouse2-fill me-1"></i>Clic droit pour les options</small>
                    </div>
                </div>
            </div>
        `).join('');

        // Ajouter les événements de clic droit
        this.setupContextMenuEvents();
    },

    /**
     * Filtrer les fiches
     */
    filterFiches: function(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filtered = this.fiches.filter(fiche =>
            fiche.numero_nncp.toLowerCase().includes(term) ||
            fiche.reference.toLowerCase().includes(term) ||
            fiche.libelle.toLowerCase().includes(term)
        );

        // Afficher temporairement les fiches filtrées
        const container = document.getElementById('fiches-list');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = '<p class="text-muted text-center py-4">Aucune fiche trouvée</p>';
            return;
        }

        container.innerHTML = filtered.map(fiche => `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1">
                                <span class="badge bg-primary">${fiche.numero_nncp}</span>
                                ${fiche.reference}
                            </h6>
                            <p class="text-muted small mb-1">${fiche.libelle}</p>
                        </div>
                        <span class="badge ${this.getStatusBadgeClass(fiche.status)}">
                            ${this.getStatusLabel(fiche.status)}
                        </span>
                    </div>
                    <div class="row g-2 small">
                        <div class="col-md-3">
                            <strong>Quantité:</strong> ${fiche.quantite}
                        </div>
                        <div class="col-md-3">
                            <strong>Prix:</strong> ${fiche.prix_total} €
                        </div>
                        <div class="col-md-3">
                            <strong>Date:</strong> ${new Date(fiche.date_production).toLocaleDateString('fr-FR')}
                        </div>
                        <div class="col-md-3">
                            <strong>49MS:</strong> ${fiche.decision_49ms ? '✅ Oui' : '❌ Non'}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Obtenir la classe CSS du badge de statut
     */
    getStatusBadgeClass: function(status) {
        const classes = {
            'pending': 'bg-warning text-dark',
            'in_progress': 'bg-info',
            'completed': 'bg-success',
            'cancelled': 'bg-secondary'
        };
        return classes[status] || 'bg-secondary';
    },

    /**
     * Obtenir le libellé du statut
     */
    getStatusLabel: function(status) {
        const labels = {
            'pending': 'En attente',
            'in_progress': 'En cours',
            'completed': 'Terminé',
            'cancelled': 'Annulé'
        };
        return labels[status] || status;
    },

    /**
     * Afficher un message d'erreur
     */
    showError: function(message) {
        const errorDiv = document.getElementById('fiche-error-message');
        const errorText = document.getElementById('fiche-error-text');

        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.style.display = 'block';

            // Auto-hide après 5 secondes
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    },

    /**
     * Masquer le message d'erreur
     */
    hideError: function() {
        const errorDiv = document.getElementById('fiche-error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    },

    /**
     * Afficher un message de succès
     */
    showSuccess: function(message) {
        // Créer un message de succès temporaire
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success mt-3';
        successDiv.innerHTML = `<i class="bi bi-check-circle me-2"></i>${message}`;

        const form = document.getElementById('fiche-etoile-form');
        if (form) {
            form.appendChild(successDiv);

            // Auto-remove après 3 secondes
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
    },

    /**
     * Configurer les événements de menu contextuel
     */
    setupContextMenuEvents: function() {
        const contextMenu = document.getElementById('fiche-context-menu');
        const isAdmin = typeof SimpleAuth !== 'undefined' && SimpleAuth.isAdmin();
        let currentFicheId = null;

        // Afficher le bon menu selon le rôle
        if (isAdmin) {
            document.getElementById('context-menu-admin').style.display = 'block';
            document.getElementById('context-menu-visitor').style.display = 'none';
        } else {
            document.getElementById('context-menu-admin').style.display = 'none';
            document.getElementById('context-menu-visitor').style.display = 'block';
        }

        // Événement clic droit sur les fiches
        document.querySelectorAll('.fiche-card').forEach(card => {
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();

                currentFicheId = parseInt(card.dataset.ficheId);

                // Positionner le menu
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            });
        });

        // Fermer le menu en cliquant ailleurs
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        // Actions Admin
        if (isAdmin) {
            document.getElementById('context-print').addEventListener('click', (e) => {
                e.preventDefault();
                this.printFiche(currentFicheId);
                contextMenu.style.display = 'none';
            });

            document.getElementById('context-edit').addEventListener('click', (e) => {
                e.preventDefault();
                this.editFiche(currentFicheId);
                contextMenu.style.display = 'none';
            });

            document.getElementById('context-delete').addEventListener('click', (e) => {
                e.preventDefault();
                const fiche = this.fiches.find(f => f.id === currentFicheId);
                if (fiche) {
                    this.deleteFiche(currentFicheId, fiche.numero_nncp);
                }
                contextMenu.style.display = 'none';
            });
        } else {
            // Action Visiteur
            document.getElementById('context-download').addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadFiche(currentFicheId);
                contextMenu.style.display = 'none';
            });
        }
    },

    /**
     * Imprimer une fiche
     */
    printFiche: function(ficheId) {
        const fiche = this.fiches.find(f => f.id === ficheId);
        if (!fiche) {
            alert('Fiche introuvable');
            return;
        }

        const prixTotal = (fiche.quantite * fiche.prix_unitaire).toFixed(2);

        const printContent = `
            <div class="p-4">
                <div class="text-center mb-4">
                    <h3 class="fw-bold" style="color: #f0ad4e;">⚠️ DÉCLARATION DE NON-CONFORMITÉ PRODUCTION</h3>
                    <h4 style="color: #0d6efd;">${fiche.numero_nncp}</h4>
                </div>

                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr><th colspan="2" class="text-center">ZONE PRODUCTION</th></tr>
                    </thead>
                    <tbody>
                        <tr><th style="width: 30%;">Référence:</th><td><strong>${fiche.reference}</strong></td></tr>
                        <tr><th>Libellé:</th><td>${fiche.libelle}</td></tr>
                        <tr><th>Quantité:</th><td><strong>${fiche.quantite}</strong></td></tr>
                        <tr><th>Prix unitaire:</th><td>${fiche.prix_unitaire.toFixed(5)} €</td></tr>
                        <tr><th>Prix total:</th><td><strong style="color: #198754;">${prixTotal} €</strong></td></tr>
                        <tr><th>Date de production:</th><td>${new Date(fiche.date_production).toLocaleDateString('fr-FR')}</td></tr>
                        <tr><th>Opérateur:</th><td>${fiche.operateur || 'Non spécifié'}</td></tr>
                    </tbody>
                </table>

                <table class="table table-bordered mt-3">
                    <thead class="table-light">
                        <tr><th colspan="2" class="text-center">DÉCISION QUALITÉ</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th style="width: 30%;">49MS:</th>
                            <td><strong>${fiche.decision_49ms ? '✓ OUI' : '✗ NON'}</strong></td>
                        </tr>
                        <tr>
                            <th>Statut:</th>
                            <td>${fiche.decision_49ms ? 'Approuvé pour 49MS' : 'En attente de décision'}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="mt-3 p-3 border">
                    <h6 class="fw-bold">Description du Problème:</h6>
                    <p class="mb-0">${fiche.probleme || 'Non spécifié'}</p>
                </div>

                <div class="mt-4 pt-3 border-top text-muted small">
                    <p class="mb-0">Document imprimé le ${new Date().toLocaleString('fr-FR')}</p>
                </div>
            </div>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fiche ${fiche.numero_nncp}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        body { padding: 20px; }
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    /**
     * Modifier une fiche (Admin seulement)
     */
    editFiche: function(ficheId) {
        const fiche = this.fiches.find(f => f.id === ficheId);
        if (!fiche) {
            alert('Fiche introuvable');
            return;
        }

        // Remplir le formulaire avec les données de la fiche
        document.getElementById('fiche-reference').value = fiche.reference;
        document.getElementById('fiche-libelle').value = fiche.libelle;
        document.getElementById('fiche-quantite').value = fiche.quantite;
        document.getElementById('fiche-date-production').value = fiche.date_production;
        document.getElementById('fiche-operateur').value = fiche.operateur || '';
        document.getElementById('fiche-probleme').value = fiche.probleme || '';
        document.getElementById('fiche-decision-49ms').checked = fiche.decision_49ms;

        // Mettre à jour la référence courante
        this.currentReference = {
            reference: fiche.reference,
            libelle: fiche.libelle,
            prix_unitaire: fiche.prix_unitaire
        };

        // Calculer le prix total
        this.calculatePrixTotal();

        // Scroll vers le formulaire
        document.getElementById('fiche-etoile-form').scrollIntoView({ behavior: 'smooth' });

        this.showSuccess(`📝 Modification de la fiche ${fiche.numero_nncp} - Modifiez les champs puis prévisualisez`);
    },

    /**
     * Supprimer une fiche (Admin seulement)
     */
    deleteFiche: async function(ficheId, numeroNNCP) {
        if (!confirm(`⚠️ Voulez-vous vraiment supprimer la fiche ${numeroNNCP} ?\n\nCette action est irréversible.`)) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/${ficheId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess(`Fiche ${numeroNNCP} supprimée avec succès`);
                this.loadFichesFromServer();
            } else {
                this.showError('Erreur lors de la suppression: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            this.showError('Erreur de connexion au serveur');
        }
    },

    /**
     * Télécharger une fiche en PDF (Visiteurs)
     */
    downloadFiche: function(ficheId) {
        // Pour l'instant, on utilise l'impression
        // Dans une vraie application, utilisez jsPDF ou pdfmake
        this.printFiche(ficheId);
    }
};

// Initialize only on forms.html page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Only initialize if the form exists on this page
        if (document.getElementById('fiche-etoile-form')) {
            FicheEtoileModule.init();
        }
    });
} else {
    // Only initialize if the form exists on this page
    if (document.getElementById('fiche-etoile-form')) {
        FicheEtoileModule.init();
    }
}
