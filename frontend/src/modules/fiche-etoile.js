// Fiche Étoile Module - Déclaration de Non-Conformité Production
const FicheEtoileModule = {
    fiches: [],
    references850MS: [],
    currentReference: null,
    currentNumeroNNCP: null,
    editingFicheId: null, // ID de la fiche en cours de modification
    currentFicheId: null, // ID de la fiche pour le menu contextuel
    contextMenuInitialized: false, // Flag pour éviter la réinitialisation multiple
    API_URL: window.Config ? window.Config.apiFichesEtoile : 'http://10.192.14.223:1880/api/fiches-etoile',
    REFERENCES_URL: window.Config ? window.Config.apiReferences : 'http://10.192.14.223:1880/api/references/850ms',
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
        console.log('🔧 Configuration des event listeners (formulaire uniquement)...');

        // Changement de référence
        const refSelect = document.getElementById('fiche-reference');
        if (refSelect) {
            refSelect.addEventListener('change', () => this.onReferenceChange());
            console.log('✅ Listener référence attaché');
        }

        // Changement de quantité
        const quantiteInput = document.getElementById('fiche-quantite');
        if (quantiteInput) {
            quantiteInput.addEventListener('input', () => this.calculatePrixTotal());
            console.log('✅ Listener quantité attaché');
        }

        // Search fiches
        const searchInput = document.getElementById('fiches-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterFiches(e.target.value);
            });
            console.log('✅ Listener recherche attaché');
        }

        console.log('🎉 Listeners formulaire configurés (boutons utilisent onclick)');
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
        console.log('👁️ showPreview() appelée');

        // Récupérer les données du formulaire
        const reference = document.getElementById('fiche-reference').value;
        const libelle = document.getElementById('fiche-libelle').value;
        const quantite = parseInt(document.getElementById('fiche-quantite').value);
        const dateProduction = document.getElementById('fiche-date-production').value;
        const operateur = document.getElementById('fiche-operateur').value || 'Non spécifié';
        const problemeSelect = document.getElementById('fiche-probleme');
        const probleme = problemeSelect.value || 'Non spécifié';

        console.log('📋 Données formulaire:', { reference, libelle, quantite, dateProduction, probleme });

        // Validation des champs obligatoires
        if (!reference || !libelle || !quantite || !dateProduction || !probleme) {
            console.error('❌ Champs obligatoires manquants');
            this.showError('Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        // Assurer que currentReference est défini
        this.ensureCurrentReference(reference, libelle);

        // Si toujours pas de currentReference, c'est une erreur
        if (!this.currentReference || !this.currentReference.prix_unitaire) {
            console.error('❌ Impossible de déterminer le prix unitaire');
            this.showError('Erreur: prix unitaire introuvable pour cette référence');
            return;
        }

        console.log('✅ Validation réussie, génération du HTML');

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
                                        <td>${this.formatDate(dateProduction)}</td>
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
                            <div class="card-header bg-info bg-opacity-10">
                                <h6 class="mb-0"><i class="bi bi-info-circle me-2"></i>Statut</h6>
                            </div>
                            <div class="card-body d-flex flex-column justify-content-center">
                                <div class="alert alert-info mb-0">
                                    <strong>Type:</strong> Déclaration de Non-Conformité Production
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
        console.log('✅ Modal de prévisualisation ouverte');
    },

    /**
     * S'assurer que currentReference est défini correctement
     */
    ensureCurrentReference: function(reference, libelle) {
        // Si currentReference existe déjà et correspond à la référence actuelle, OK
        if (this.currentReference && this.currentReference.reference === reference) {
            console.log('✅ currentReference déjà défini:', this.currentReference);
            return;
        }

        console.log('🔄 Tentative de reconstruction de currentReference...');

        // Essayer de récupérer depuis le select
        const refSelect = document.getElementById('fiche-reference');
        const selectedOption = refSelect.options[refSelect.selectedIndex];

        if (selectedOption && selectedOption.dataset.prixUnitaire) {
            this.currentReference = {
                reference: reference,
                libelle: selectedOption.dataset.libelle || libelle,
                prix_unitaire: parseFloat(selectedOption.dataset.prixUnitaire)
            };
            console.log('✅ currentReference reconstruit depuis le select:', this.currentReference);
            return;
        }

        // Si on est en mode édition, chercher dans la liste des fiches
        if (this.editingFicheId !== null) {
            const fiche = this.fiches.find(f => f.id === this.editingFicheId);
            if (fiche) {
                this.currentReference = {
                    reference: fiche.reference,
                    libelle: fiche.libelle,
                    prix_unitaire: fiche.prix_unitaire
                };
                console.log('✅ currentReference reconstruit depuis la fiche en édition:', this.currentReference);
                return;
            }
        }

        console.error('❌ Impossible de reconstruire currentReference');
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
     * Soumettre la fiche (création ou modification)
     */
    submitFiche: async function() {
        console.log('🚀 submitFiche() appelée');
        console.log('📊 Mode édition:', this.editingFicheId);

        // Récupérer les données du formulaire
        const reference = document.getElementById('fiche-reference').value;
        const libelle = document.getElementById('fiche-libelle').value;
        const quantite = parseInt(document.getElementById('fiche-quantite').value);
        const dateProduction = document.getElementById('fiche-date-production').value;
        const operateur = document.getElementById('fiche-operateur').value || 'Non spécifié';
        const problemeSelect = document.getElementById('fiche-probleme');
        const probleme = problemeSelect.value || 'Non spécifié';

        console.log('📝 Données formulaire:', { reference, libelle, quantite, dateProduction, probleme });
        console.log('📦 currentReference:', this.currentReference);

        // Validation
        if (!reference || !libelle || !quantite || !dateProduction || !probleme) {
            console.error('❌ Validation échouée: champs obligatoires manquants');
            this.showError('Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        // Assurer que currentReference est défini
        this.ensureCurrentReference(reference, libelle);

        // Si toujours pas de currentReference, c'est une erreur
        if (!this.currentReference || !this.currentReference.prix_unitaire) {
            console.error('❌ Validation échouée: prix unitaire introuvable');
            this.showError('Erreur: prix unitaire introuvable pour cette référence');
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
            status: 'pending'
        };

        console.log('📤 Envoi de la fiche:', ficheData);

        try {
            let response;
            let isEditing = this.editingFicheId !== null;

            if (isEditing) {
                // MODE MODIFICATION - Utiliser PUT
                console.log(`📝 Modification de la fiche ID: ${this.editingFicheId}`);
                response = await fetch(`${this.API_URL}/${this.editingFicheId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ficheData)
                });
            } else {
                // MODE CRÉATION - Utiliser POST
                console.log('📝 Création d\'une nouvelle fiche');
                response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(ficheData)
                });
            }

            const result = await response.json();

            if (result.success) {
                const action = isEditing ? 'modifiée' : 'créée';
                console.log(`✅ Fiche ${action} avec succès:`, result.numero_nncp || ficheData.numero_nncp);

                // Fermer la modal de prévisualisation si elle est ouverte
                const modal = bootstrap.Modal.getInstance(document.getElementById('preview-nncp-modal'));
                if (modal) {
                    modal.hide();
                }

                this.showSuccess(`Fiche ${result.numero_nncp || ficheData.numero_nncp} ${action} avec succès!`);
                this.resetForm();

                if (!isEditing) {
                    this.loadNextNumeroNNCP(); // Charger le prochain numéro seulement si création
                }

                this.loadFichesFromServer(); // Rafraîchir la liste
            } else {
                const action = isEditing ? 'la modification' : 'la création';
                this.showError(`Erreur lors de ${action}: ` + result.error);
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

        this.currentReference = null;
        this.editingFicheId = null; // Réinitialiser le mode édition
        this.hideError();

        // Mettre à jour le titre pour indiquer mode création
        const numericSpan = document.getElementById('current-numero-nncp');
        if (numericSpan && this.currentNumeroNNCP) {
            numericSpan.textContent = this.currentNumeroNNCP;
            numericSpan.classList.remove('text-warning');
            numericSpan.classList.add('text-primary');
        }
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
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 4rem; color: #dee2e6;"></i>
                    <p class="text-muted mt-3">Aucune fiche enregistrée</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.fiches.map(fiche => {
            const statusInfo = this.getStatusInfo(fiche.status);

            return `
            <div class="fiche-card-modern" data-fiche-id="${fiche.id}">
                <div class="fiche-card-header">
                    <div class="fiche-numero-ref">
                        <span class="fiche-numero">${fiche.numero_nncp}</span>
                        <h6 class="fiche-reference">${fiche.reference}</h6>
                    </div>
                    <span class="fiche-status-badge" style="background: ${statusInfo.color};">
                        <i class="bi ${statusInfo.icon} me-1"></i>${statusInfo.label}
                    </span>
                </div>

                <p class="fiche-libelle">${fiche.libelle}</p>

                <div class="fiche-info-grid">
                    <div class="fiche-info-item">
                        <i class="bi bi-box-seam info-icon"></i>
                        <div>
                            <span class="info-label">Quantité</span>
                            <span class="info-value">${fiche.quantite}</span>
                        </div>
                    </div>

                    <div class="fiche-info-item">
                        <i class="bi bi-currency-euro info-icon"></i>
                        <div>
                            <span class="info-label">Prix total</span>
                            <span class="info-value">${fiche.prix_total} €</span>
                        </div>
                    </div>

                    <div class="fiche-info-item">
                        <i class="bi bi-calendar-event info-icon"></i>
                        <div>
                            <span class="info-label">Date production</span>
                            <span class="info-value">${this.formatDate(fiche.date_production)}</span>
                        </div>
                    </div>

                    <div class="fiche-info-item">
                        <i class="bi bi-person-badge info-icon"></i>
                        <div>
                            <span class="info-label">Opérateur</span>
                            <span class="info-value">${fiche.operateur || 'Non spécifié'}</span>
                        </div>
                    </div>
                </div>

                ${fiche.probleme && fiche.probleme !== 'Non spécifié' ? `
                <div class="fiche-probleme">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    <span>${fiche.probleme}</span>
                </div>
                ` : ''}

                <div class="fiche-footer">
                    <span class="fiche-context-hint">
                        <i class="bi bi-mouse2-fill me-1"></i>Clic droit pour actions
                    </span>
                </div>
            </div>
            `;
        }).join('');

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
                        <div class="col-md-4">
                            <strong>Quantité:</strong> ${fiche.quantite}
                        </div>
                        <div class="col-md-4">
                            <strong>Prix:</strong> ${fiche.prix_total} €
                        </div>
                        <div class="col-md-4">
                            <strong>Date:</strong> ${this.formatDate(fiche.date_production)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Formater une date correctement (sans problème de timezone)
     */
    formatDate: function(dateString) {
        if (!dateString) return 'Non spécifié';

        // Si la date contient 'T' (format ISO), extraire juste la partie date
        let datePart = dateString;
        if (typeof dateString === 'string' && dateString.includes('T')) {
            datePart = dateString.split('T')[0];
        }

        // Convertir en string si ce n'est pas déjà le cas
        datePart = String(datePart);

        // Parser directement la chaîne YYYY-MM-DD
        const parts = datePart.split('-');
        if (parts.length !== 3) {
            return dateString;
        }

        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');

        // Retourner au format DD/MM/YYYY sans utiliser Date()
        return `${day}/${month}/${year}`;
    },

    /**
     * Obtenir les informations complètes du statut (couleur, icône, libellé)
     */
    getStatusInfo: function(status) {
        const statusMap = {
            'pending': {
                color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                icon: 'bi-hourglass-split',
                label: 'En attente'
            },
            'in_progress': {
                color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                icon: 'bi-arrow-repeat',
                label: 'En cours'
            },
            'completed': {
                color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                icon: 'bi-check-circle',
                label: 'Vérifié'
            },
            'cancelled': {
                color: 'linear-gradient(135deg, #a8a8a8 0%, #6c757d 100%)',
                icon: 'bi-x-circle',
                label: 'Annulé'
            }
        };
        return statusMap[status] || statusMap['pending'];
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
            'completed': 'Vérifié',
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

        // Afficher le bon menu selon le rôle
        if (isAdmin) {
            document.getElementById('context-menu-admin').style.display = 'block';
            document.getElementById('context-menu-visitor').style.display = 'none';
        } else {
            document.getElementById('context-menu-admin').style.display = 'none';
            document.getElementById('context-menu-visitor').style.display = 'block';
        }

        // Événement clic droit sur les fiches
        document.querySelectorAll('.fiche-card-modern').forEach(card => {
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();

                // Stocker l'ID dans la variable globale du module
                this.currentFicheId = parseInt(card.dataset.ficheId);
                console.log('📌 Fiche sélectionnée ID:', this.currentFicheId);

                // Positionner le menu
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            });
        });

        // Ne configurer les événements de menu qu'une seule fois
        if (!this.contextMenuInitialized) {
            console.log('🔧 Initialisation unique des événements de menu contextuel');

            // Fermer le menu en cliquant ailleurs
            document.addEventListener('click', () => {
                contextMenu.style.display = 'none';
            });

            // Actions Admin
            if (isAdmin) {
                document.getElementById('context-print').addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🖨️ Impression fiche ID:', this.currentFicheId);
                    this.printFiche(this.currentFicheId);
                    contextMenu.style.display = 'none';
                });

                document.getElementById('context-delete').addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('🗑️ Suppression fiche ID:', this.currentFicheId);
                    const fiche = this.fiches.find(f => f.id === this.currentFicheId);
                    if (fiche) {
                        this.deleteFiche(this.currentFicheId, fiche.numero_nncp);
                    }
                    contextMenu.style.display = 'none';
                });
            } else {
                // Action Visiteur
                document.getElementById('context-download').addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('📥 Téléchargement fiche ID:', this.currentFicheId);
                    this.downloadFiche(this.currentFicheId);
                    contextMenu.style.display = 'none';
                });
            }

            this.contextMenuInitialized = true;
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
                        <tr><th>Date de production:</th><td>${this.formatDate(fiche.date_production)}</td></tr>
                        <tr><th>Opérateur:</th><td>${fiche.operateur || 'Non spécifié'}</td></tr>
                    </tbody>
                </table>

                <table class="table table-bordered mt-3">
                    <thead class="table-light">
                        <tr><th colspan="2" class="text-center">STATUT</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th style="width: 30%;">Type:</th>
                            <td><strong>Déclaration de Non-Conformité Production</strong></td>
                        </tr>
                        <tr>
                            <th>Statut:</th>
                            <td>${this.getStatusLabel(fiche.status)}</td>
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

        console.log('✏️ Edition de la fiche:', fiche);

        // Activer le mode édition
        this.editingFicheId = ficheId;

        // Mettre à jour la référence courante AVANT de remplir le formulaire
        // C'est crucial pour que la validation fonctionne
        this.currentReference = {
            reference: fiche.reference,
            libelle: fiche.libelle,
            prix_unitaire: fiche.prix_unitaire
        };
        console.log('📦 currentReference défini:', this.currentReference);

        // Mettre à jour le numéro NNCP pour afficher celui de la fiche en cours d'édition
        this.currentNumeroNNCP = fiche.numero_nncp;
        const numericSpan = document.getElementById('current-numero-nncp');
        if (numericSpan) {
            numericSpan.textContent = `${fiche.numero_nncp} (MODIFICATION)`;
            numericSpan.classList.remove('text-primary');
            numericSpan.classList.add('text-warning');
        }

        // Convertir la date au format YYYY-MM-DD pour l'input HTML5
        let dateFormatted = fiche.date_production;
        if (dateFormatted && dateFormatted.includes('T')) {
            // Si c'est un timestamp ISO (2025-01-12T00:00:00.000Z), extraire juste la date
            dateFormatted = dateFormatted.split('T')[0];
        } else if (dateFormatted && dateFormatted.includes('/')) {
            // Si c'est au format DD/MM/YYYY, convertir en YYYY-MM-DD
            const parts = dateFormatted.split('/');
            if (parts.length === 3) {
                dateFormatted = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        console.log('📅 Date production:', fiche.date_production, '→', dateFormatted);

        // Remplir le formulaire avec les données de la fiche
        document.getElementById('fiche-reference').value = fiche.reference;
        document.getElementById('fiche-libelle').value = fiche.libelle;
        document.getElementById('fiche-quantite').value = fiche.quantite;
        document.getElementById('fiche-date-production').value = dateFormatted;
        document.getElementById('fiche-operateur').value = fiche.operateur || '';

        // Gérer le champ problème (select au lieu de textarea)
        const problemeSelect = document.getElementById('fiche-probleme');
        if (problemeSelect) {
            problemeSelect.value = fiche.probleme || '';
        }

        // Calculer le prix total
        this.calculatePrixTotal();

        // Scroll vers le formulaire
        document.getElementById('fiche-etoile-form').scrollIntoView({ behavior: 'smooth' });

        this.showSuccess(`📝 Modification de la fiche ${fiche.numero_nncp} - Modifiez les champs puis prévisualisez et envoyez`);
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

// Exporter le module globalement pour permettre l'utilisation avec onclick
window.FicheEtoileModule = FicheEtoileModule;
console.log('🌍 FicheEtoileModule exporté globalement:', window.FicheEtoileModule);
console.log('🔍 Test d\'accessibilité - Essayez: window.FicheEtoileModule.showPreview()');

// Test immédiat
setTimeout(() => {
    if (window.FicheEtoileModule) {
        console.log('✅ FicheEtoileModule est accessible après 1 seconde');
    } else {
        console.error('❌ FicheEtoileModule n\'est PAS accessible après 1 seconde');
    }
}, 1000);

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
