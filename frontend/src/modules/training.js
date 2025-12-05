const TrainingDocumentsModule = {
    API_URL: window.Config ? window.Config.apiDocumentsTraining : 'http://10.192.14.223:1880/api/documents/training',
    documents: [],
    initialized: false,

    init: function() {
        console.log('📚 Initialisation du module Formation...');
        console.log('📚 SimpleAuth disponible?', typeof SimpleAuth !== 'undefined');
        console.log('📚 isLoggedIn?', typeof SimpleAuth !== 'undefined' ? SimpleAuth.isLoggedIn() : 'N/A');
        console.log('📚 getUserRole?', typeof SimpleAuth !== 'undefined' ? SimpleAuth.getUserRole() : 'N/A');

        // Check if we're on the training page
        const headerActions = document.getElementById('training-header-actions');
        if (!headerActions) {
            console.log('⚠️ [Training] Pas sur la page training.html, skip init');
            return;
        }

        this.initialized = true;
        this.setupUploadButton();
        this.setupUploadForm();
        this.loadDocumentsFromServer();

        // Force update after delays to ensure auth is fully loaded
        setTimeout(() => {
            console.log('⏰ [Training] Force update après 100ms');
            console.log('⏰ isLoggedIn après délai?', SimpleAuth.isLoggedIn());
            this.setupUploadButton();
        }, 100);

        setTimeout(() => {
            console.log('⏰⏰ [Training] Second force update après 500ms');
            console.log('⏰⏰ isLoggedIn après délai?', SimpleAuth.isLoggedIn());
            this.setupUploadButton();
        }, 500);

        // Listen for auth state changes
        window.addEventListener('authStateChanged', () => {
            console.log('🔄 Auth state changed, updating UI...');
            console.log('🔄 isLoggedIn après changement?', SimpleAuth.isLoggedIn());
            this.updateUIBasedOnAuth();
        });
    },

    // Setup upload button visibility based on authentication
    setupUploadButton: function() {
        const headerActions = document.getElementById('training-header-actions');
        console.log('🔍 [Training] setupUploadButton appelé');
        console.log('  - headerActions existe?', !!headerActions);
        console.log('  - SimpleAuth défini?', typeof SimpleAuth !== 'undefined');

        if (typeof SimpleAuth !== 'undefined') {
            console.log('  - SimpleAuth.isLoggedIn():', SimpleAuth.isLoggedIn());
            console.log('  - localStorage mg_logged_in:', localStorage.getItem('mg_logged_in'));
            console.log('  - localStorage mg_session_id:', localStorage.getItem('mg_session_id'));
            console.log('  - localStorage mg_username:', localStorage.getItem('mg_username'));
        }

        if (!headerActions) {
            console.warn('❌ [Training] Element training-header-actions non trouvé');
            return;
        }

        // Tous les utilisateurs connectés peuvent ajouter des documents
        if (typeof SimpleAuth !== 'undefined' && SimpleAuth.isLoggedIn()) {
            console.log('✅ [Training] Utilisateur connecté, ajout du bouton');
            console.log('✅ headerActions.innerHTML AVANT:', headerActions.innerHTML);

            headerActions.innerHTML = `
                <button class="btn btn-info text-white" id="show-upload-btn">
                    <i class="bi bi-plus-circle me-1"></i>
                    Ajouter un document
                </button>
            `;

            console.log('✅ headerActions.innerHTML APRÈS:', headerActions.innerHTML);

            const showUploadBtn = document.getElementById('show-upload-btn');
            console.log('✅ Bouton trouvé?', !!showUploadBtn);

            if (showUploadBtn) {
                showUploadBtn.addEventListener('click', () => this.showUploadForm());
                console.log('✅ Event listener ajouté au bouton');
            }
        } else {
            console.log('❌ [Training] Utilisateur non connecté, pas de bouton');
            console.log('❌ Raison: SimpleAuth défini?', typeof SimpleAuth !== 'undefined', '| isLoggedIn?', typeof SimpleAuth !== 'undefined' ? SimpleAuth.isLoggedIn() : 'N/A');
            headerActions.innerHTML = '';
        }
    },

    // Show/hide upload form
    showUploadForm: function() {
        const uploadSection = document.getElementById('admin-upload-section');
        if (uploadSection) {
            uploadSection.style.display = 'block';
            uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
    },

    hideUploadForm: function() {
        const uploadSection = document.getElementById('admin-upload-section');
        if (uploadSection) {
            uploadSection.style.display = 'none';
        }
    },

    // Setup upload form handlers
    setupUploadForm: function() {
        const uploadForm = document.getElementById('training-upload-form');
        const fileInput = document.getElementById('doc-file');
        const fileName = document.getElementById('file-name');
        const cancelBtn = document.getElementById('cancel-upload');

        // File input change handler
        if (fileInput && fileName) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileName.textContent = `✅ ${file.name}`;
                } else {
                    fileName.textContent = '';
                }
            });
        }

        // Cancel button handler
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (uploadForm) uploadForm.reset();
                if (fileName) fileName.textContent = '';
                this.hideUploadForm();
            });
        }

        // Form submission handler
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleUpload(e);
            });
        }
    },

    // Handle file upload
    handleUpload: async function(e) {
        const form = e.target;
        const fileInput = document.getElementById('doc-file');
        const file = fileInput.files[0];

        if (!file) {
            this.showToast('Veuillez sélectionner un fichier', 'error');
            return;
        }

        // Validate file type
        const allowedExtensions = ['.pdf', '.ppt', '.pptx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            this.showToast('Format de fichier non supporté. Utilisez PDF, PPT ou PPTX uniquement', 'error');
            return;
        }

        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            this.showToast('Le fichier est trop volumineux (max 50MB)', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split spinner-border spinner-border-sm me-1"></i> Upload en cours...';

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', document.getElementById('doc-title').value);
            formData.append('category', document.getElementById('doc-category').value);
            formData.append('description', document.getElementById('doc-description').value || '');
            formData.append('uploaded_by', SimpleAuth.getCurrentUser() || 'Admin');
            formData.append('uploadType', 'training'); // Pour multer

            // Send to server
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Document uploadé avec succès !', 'success');
                form.reset();
                document.getElementById('file-name').textContent = '';
                this.hideUploadForm();
                this.loadDocumentsFromServer();
            } else {
                this.showToast('Erreur: ' + (result.error || 'Upload échoué'), 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showToast('Erreur lors de l\'upload du fichier', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    },

    // Load documents from server
    loadDocumentsFromServer: async function() {
        try {
            const response = await fetch(this.API_URL);
            const result = await response.json();

            if (result.success) {
                this.documents = result.data || [];
                console.log(`✅ ${this.documents.length} documents de formation chargés`);
                this.displayDocuments();
            } else {
                console.error('❌ Erreur lors du chargement des documents:', result.error);
                this.documents = [];
                this.displayDocuments();
            }
        } catch (error) {
            console.error('❌ Erreur réseau:', error);
            this.documents = [];
            this.displayDocuments();
        }
    },

    // Display training documents
    displayDocuments: function() {
        const documentsList = document.getElementById('training-documents-list');
        if (!documentsList) return;

        const isAdmin = typeof SimpleAuth !== 'undefined' && SimpleAuth.isAdmin();
        const isLoggedIn = typeof SimpleAuth !== 'undefined' && SimpleAuth.isLoggedIn();

        if (this.documents.length === 0) {
            documentsList.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-folder2-open" style="font-size: 4rem; color: #dee2e6;"></i>
                    <p class="text-muted mt-3">Aucun document de formation disponible</p>
                    ${isLoggedIn ? '<p class="small text-muted">Utilisez le bouton ci-dessus pour ajouter des documents</p>' : ''}
                </div>
            `;
            return;
        }

        // Group documents by category
        const categories = {
            'basics': { name: 'Concepts de base', docs: [], icon: 'bi-book' },
            'controls': { name: 'Contrôles qualité', docs: [], icon: 'bi-clipboard-check' },
            'procedures': { name: 'Procédures', docs: [], icon: 'bi-list-check' },
            'standards': { name: 'Normes', docs: [], icon: 'bi-award' },
            'tools': { name: 'Outils', docs: [], icon: 'bi-tools' },
            'other': { name: 'Autre', docs: [], icon: 'bi-file-earmark' }
        };

        this.documents.forEach(doc => {
            const category = doc.category || 'other';
            if (categories[category]) {
                categories[category].docs.push(doc);
            } else {
                categories['other'].docs.push(doc);
            }
        });

        documentsList.innerHTML = '';

        // Display each category
        Object.keys(categories).forEach(catKey => {
            const cat = categories[catKey];
            if (cat.docs.length === 0) return;

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'mb-4';
            categoryDiv.innerHTML = `
                <h6 class="text-info mb-3">
                    <i class="${cat.icon} me-2"></i>${cat.name} (${cat.docs.length})
                </h6>
                <div id="category-${catKey}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 1.5rem; padding: 1rem 0;"></div>
            `;
            documentsList.appendChild(categoryDiv);

            const categoryContainer = categoryDiv.querySelector(`#category-${catKey}`);

            cat.docs.forEach(doc => {
                const docCard = this.createDocumentCard(doc, isAdmin);
                categoryContainer.appendChild(docCard);
            });
        });
    },

    // Create document card
    createDocumentCard: function(doc, isAdmin) {
        const col = document.createElement('div');

        // Get file extension and icon
        const ext = doc.filename.split('.').pop().toLowerCase();
        const isPDF = ext === 'pdf';
        const isPPT = ['ppt', 'pptx'].includes(ext);
        const isDoc = ['doc', 'docx'].includes(ext);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

        // Get icon and badge style
        let iconClass = 'bi-file-earmark';
        let badgeColor = '#667eea';
        if (isPDF) {
            iconClass = 'bi-file-earmark-pdf';
            badgeColor = '#ef4444';
        } else if (isPPT) {
            iconClass = 'bi-file-earmark-slides';
            badgeColor = '#f59e0b';
        } else if (isDoc) {
            iconClass = 'bi-file-earmark-word';
            badgeColor = '#3b82f6';
        } else if (isImage) {
            iconClass = 'bi-file-earmark-image';
            badgeColor = '#10b981';
        } else if (isVideo) {
            iconClass = 'bi-camera-video';
            badgeColor = '#8b5cf6';
        }

        // Format date
        const uploadDate = doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('fr-FR') : 'N/A';

        // Escape doc.id for safe use in onclick (it's a string with special chars)
        const escapedId = doc.id.replace(/'/g, "\\'");

        // Category names
        const categoryNames = {
            'basics': 'Concepts de base',
            'controls': 'Contrôles qualité',
            'procedures': 'Procédures',
            'standards': 'Normes',
            'tools': 'Outils',
            'other': 'Autre'
        };

        col.innerHTML = `
            <div class="fiche-card-modern">
                <div class="fiche-card-header">
                    <div class="fiche-numero-ref">
                        <span class="fiche-numero" style="background: ${badgeColor};">
                            <i class="bi ${iconClass} me-1"></i>${ext.toUpperCase()}
                        </span>
                        <h6 class="fiche-reference">${doc.title}</h6>
                    </div>
                </div>

                ${doc.description ? `<p class="fiche-libelle">${doc.description}</p>` : ''}

                <div class="fiche-info-grid">
                    <div class="fiche-info-item">
                        <i class="bi bi-tag info-icon"></i>
                        <div>
                            <span class="info-label">Catégorie</span>
                            <span class="info-value">${categoryNames[doc.category] || 'Autre'}</span>
                        </div>
                    </div>

                    <div class="fiche-info-item">
                        <i class="bi bi-file-earmark-text info-icon"></i>
                        <div>
                            <span class="info-label">Type</span>
                            <span class="info-value">${ext.toUpperCase()}</span>
                        </div>
                    </div>

                    <div class="fiche-info-item">
                        <i class="bi bi-calendar-event info-icon"></i>
                        <div>
                            <span class="info-label">Date ajout</span>
                            <span class="info-value">${uploadDate}</span>
                        </div>
                    </div>

                    <div class="fiche-info-item">
                        <i class="bi bi-person-badge info-icon"></i>
                        <div>
                            <span class="info-label">Ajouté par</span>
                            <span class="info-value">${doc.uploaded_by || 'Admin'}</span>
                        </div>
                    </div>
                </div>

                <div class="fiche-footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-sm btn-outline-primary" onclick="TrainingDocumentsModule.viewDocument('${escapedId}')" style="flex: 1; white-space: nowrap;">
                        <i class="bi bi-eye me-1"></i>Consulter
                    </button>
                    <button class="btn btn-sm btn-success" onclick="TrainingDocumentsModule.downloadDocument('${escapedId}')" style="flex: 1; white-space: nowrap;">
                        <i class="bi bi-download me-1"></i>Télécharger
                    </button>
                    ${isAdmin ? `
                    <button class="btn btn-sm btn-outline-danger" onclick="TrainingDocumentsModule.deleteDocument('${escapedId}')" style="white-space: nowrap;">
                        <i class="bi bi-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        `;

        return col;
    },

    // View document
    viewDocument: function(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) {
            this.showToast('Document non trouvé', 'error');
            return;
        }

        console.log('📄 Viewing document:', doc);

        const modal = document.getElementById('document-viewer-modal');
        const titleElement = document.getElementById('viewer-doc-title');
        const bodyElement = document.getElementById('viewer-body');
        const downloadBtn = document.getElementById('viewer-download-btn');

        if (!modal || !titleElement || !bodyElement) return;

        const ext = doc.filename.split('.').pop().toLowerCase();

        // Construire l'URL de base depuis la configuration
        const baseURL = this.API_URL.replace('/api/documents/training', '');
        const filePath = `${baseURL}${doc.filepath}`;

        console.log('📄 Base URL:', baseURL);
        console.log('📄 Document filepath:', doc.filepath);
        console.log('📄 Final file path:', filePath);

        // Escape doc.id for safe use in onclick
        const escapedId = String(doc.id).replace(/'/g, "\\'");

        titleElement.textContent = doc.title;

        // Show loading
        bodyElement.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100">
                <div class="text-center">
                    <div class="spinner-border text-info" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="mt-3 text-muted">Chargement du document...</p>
                </div>
            </div>
        `;

        // Open modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Load document based on type
        setTimeout(() => {
            if (ext === 'pdf') {
                // Afficher le PDF avec des options de secours
                bodyElement.innerHTML = `
                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                        <div style="flex: 1; overflow: hidden; position: relative;">
                            <embed
                                src="${filePath}#toolbar=0&navpanes=0&scrollbar=1&view=FitH"
                                type="application/pdf"
                                style="width: 100%; height: 100%; border: none;"
                            >
                            </embed>
                        </div>
                        <div style="padding: 1rem; background: #f8f9fa; border-top: 1px solid #dee2e6; display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-success" onclick="TrainingDocumentsModule.downloadDocument('${escapedId}')">
                                <i class="bi bi-download me-2"></i>Télécharger le PDF
                            </button>
                            <a href="${filePath}" target="_blank" class="btn btn-outline-primary">
                                <i class="bi bi-box-arrow-up-right me-2"></i>Ouvrir dans un nouvel onglet
                            </a>
                        </div>
                    </div>
                `;
            } else if (['ppt', 'pptx'].includes(ext)) {
                bodyElement.innerHTML = `
                    <div class="d-flex flex-column justify-content-center align-items-center h-100 p-5">
                        <i class="bi bi-file-earmark-slides text-warning" style="font-size: 5rem;"></i>
                        <h4 class="mt-4">Visualisation PowerPoint</h4>
                        <p class="text-muted text-center">Les fichiers PowerPoint ne peuvent pas être visualisés directement dans le navigateur.</p>
                        <p class="text-center"><strong>Téléchargez le fichier pour l'ouvrir avec PowerPoint</strong></p>
                        <button class="btn btn-success mt-3" onclick="TrainingDocumentsModule.downloadDocument('${escapedId}')">
                            <i class="bi bi-download me-2"></i>Télécharger
                        </button>
                    </div>
                `;
            } else {
                // Pour les autres types de fichiers
                bodyElement.innerHTML = `
                    <div class="d-flex flex-column justify-content-center align-items-center h-100 p-5">
                        <i class="bi bi-file-earmark text-secondary" style="font-size: 5rem;"></i>
                        <h4 class="mt-4">Aperçu non disponible</h4>
                        <p class="text-muted text-center">Ce type de fichier ne peut pas être visualisé dans le navigateur.</p>
                        <button class="btn btn-success mt-3" onclick="TrainingDocumentsModule.downloadDocument('${escapedId}')">
                            <i class="bi bi-download me-2"></i>Télécharger
                        </button>
                    </div>
                `;
            }
        }, 500);

        // Setup download button
        if (downloadBtn) {
            downloadBtn.onclick = () => this.downloadDocument(docId);
        }
    },

    // Download document
    downloadDocument: function(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) {
            this.showToast('Document non trouvé', 'error');
            return;
        }

        try {
            // Construire l'URL de base depuis la configuration
            const baseURL = this.API_URL.replace('/api/documents/training', '');
            const fileURL = `${baseURL}${doc.filepath}`;

            console.log('⬇️ Downloading:', fileURL);

            const link = document.createElement('a');
            link.href = fileURL;
            link.download = doc.filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showToast(`Téléchargement de ${doc.filename}`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showToast('Erreur lors du téléchargement', 'error');
        }
    },

    // Delete document (Admin only)
    deleteDocument: async function(docId) {
        if (typeof SimpleAuth === 'undefined' || !SimpleAuth.isAdmin()) {
            this.showToast('Accès refusé: Admin uniquement', 'error');
            return;
        }

        const doc = this.documents.find(d => d.id === docId);
        if (!doc) {
            this.showToast('Document non trouvé', 'error');
            return;
        }

        if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${doc.title}" ?`)) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/${docId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Document supprimé avec succès', 'success');
                this.loadDocumentsFromServer();
            } else {
                this.showToast('Erreur: ' + (result.error || 'Suppression échouée'), 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Erreur lors de la suppression', 'error');
        }
    },

    // Show toast notification
    showToast: function(message, type = 'info') {
        // Utiliser le système de toast existant si disponible
        if (typeof UIModule !== 'undefined' && UIModule.showToast) {
            UIModule.showToast(message, type);
        } else {
            // Fallback simple
            alert(message);
        }
    },

    // Update UI based on authentication status
    updateUIBasedOnAuth: function() {
        this.setupUploadButton();
        this.displayDocuments();
    }
};

// Exporter globalement
window.TrainingDocumentsModule = TrainingDocumentsModule;
