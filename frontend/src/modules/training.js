const TrainingDocumentsModule = {
    init: function() {
        this.setupUploadButton();
        this.setupUploadForm();
        this.displayDocuments();
        this.updateUIBasedOnAuth();

        // Listen for auth state changes
        window.addEventListener('authStateChanged', () => {
            this.updateUIBasedOnAuth();
        });
    },

    // Setup upload button visibility based on authentication
    setupUploadButton: function() {
        const headerActions = document.getElementById('training-header-actions');
        console.log('🔍 [Training] setupUploadButton appelé');
        console.log('  - headerActions existe?', !!headerActions);
        console.log('  - SimpleAuth.isLoggedIn():', SimpleAuth.isLoggedIn());

        if (!headerActions) {
            console.warn('❌ [Training] Element training-header-actions non trouvé');
            return;
        }

        if (SimpleAuth.isLoggedIn()) {
            console.log('✅ [Training] Utilisateur connecté, ajout du bouton');
            headerActions.innerHTML = `
                <button class="add-doc-btn" id="show-upload-btn">
                    <i class="fas fa-plus"></i>
                    Ajouter un document
                </button>
            `;

            const showUploadBtn = document.getElementById('show-upload-btn');
            if (showUploadBtn) {
                showUploadBtn.addEventListener('click', () => this.showUploadForm());
            }
        } else {
            console.log('❌ [Training] Utilisateur non connecté, pas de bouton');
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
                    fileName.textContent = file.name;
                } else {
                    fileName.textContent = 'Aucun fichier sélectionné';
                }
            });
        }

        // Cancel button handler
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (uploadForm) uploadForm.reset();
                if (fileName) fileName.textContent = 'Aucun fichier sélectionné';
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
            UIModule.showToast('Veuillez sélectionner un fichier', 'error');
            return;
        }

        // Validate file size (10MB max for images/videos, 5MB for documents)
        const maxSize = file.type.startsWith('image/') || file.type.startsWith('video/')
            ? 10 * 1024 * 1024 // 10MB for media
            : 5 * 1024 * 1024;  // 5MB for documents

        if (file.size > maxSize) {
            const maxSizeMB = maxSize / (1024 * 1024);
            UIModule.showToast(`Le fichier est trop volumineux (max ${maxSizeMB}MB)`, 'error');
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'video/ogg'
        ];

        if (!allowedTypes.includes(file.type)) {
            UIModule.showToast('Format de fichier non supporté. Utilisez PDF, PPT, PPTX, DOC, DOCX, images (JPG, PNG, GIF, WEBP) ou vidéos (MP4, WEBM, OGG)', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload en cours...';

        try {
            // Read file as base64
            const base64 = await this.readFileAsBase64(file);

            // Get form data
            const docData = {
                title: document.getElementById('doc-title').value,
                category: document.getElementById('doc-category').value,
                description: document.getElementById('doc-description').value || '',
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileData: base64
            };

            // Save to storage
            const saved = DataManager.addTrainingDocument(docData);

            if (saved) {
                // Add activity
                const categoryNames = {
                    'basics': 'Concepts de base',
                    'controls': 'Contrôles qualité',
                    'procedures': 'Procédures',
                    'standards': 'Normes et standards',
                    'tools': 'Outils et équipements',
                    'other': 'Autre'
                };

                ActivityModule.addActivity({
                    type: 'training_upload',
                    title: 'Document de formation ajouté',
                    description: `${docData.title} - ${categoryNames[docData.category]}`,
                    icon: 'file-upload',
                    user: SimpleAuth.getCurrentUser()
                });

                // Success
                UIModule.showToast('Document uploadé avec succès !', 'success');
                form.reset();
                document.getElementById('file-name').textContent = 'Aucun fichier sélectionné';
                this.hideUploadForm();
                this.displayDocuments();
            } else {
                UIModule.showToast('Erreur lors de l\'enregistrement. Espace de stockage insuffisant.', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            UIModule.showToast('Erreur lors de l\'upload du fichier', 'error');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    },

    // Read file as base64
    readFileAsBase64: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // Display training documents
    displayDocuments: function() {
        const documentsList = document.getElementById('training-documents-list');
        if (!documentsList) return;

        const documents = DataManager.getTrainingDocuments();

        if (documents.length === 0) {
            documentsList.innerHTML = `
                <div class="empty-docs">
                    <i class="fas fa-folder-open"></i>
                    <p>Aucun document de formation disponible pour le moment</p>
                    ${SimpleAuth.isLoggedIn() ? '<p><small>Utilisez le bouton ci-dessus pour ajouter des documents</small></p>' : ''}
                </div>
            `;
            return;
        }

        documentsList.innerHTML = '';

        documents.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'training-doc-item';

            // Get file extension and type
            const ext = doc.fileName.split('.').pop().toLowerCase();
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
            const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);
            const isPDF = ext === 'pdf';
            const isPPT = ['ppt', 'pptx'].includes(ext);
            const isDoc = ['doc', 'docx'].includes(ext);

            // Get icon class
            let iconClass = 'fa-file';
            if (isImage) iconClass = 'fa-file-image';
            else if (isVideo) iconClass = 'fa-file-video';
            else if (isPDF) iconClass = 'fa-file-pdf';
            else if (isPPT) iconClass = 'fa-file-powerpoint';
            else if (isDoc) iconClass = 'fa-file-word';

            // Category names
            const categoryNames = {
                'basics': 'Concepts de base',
                'controls': 'Contrôles qualité',
                'procedures': 'Procédures',
                'standards': 'Normes et standards',
                'tools': 'Outils et équipements',
                'other': 'Autre'
            };

            // Format file size
            const fileSize = this.formatFileSize(doc.fileSize);

            // Format upload date
            const uploadDate = Utils.formatDate(doc.uploadDate);

            // Build actions based on authentication
            let actionsHTML = `
                <button class="doc-btn view" onclick="TrainingDocumentsModule.viewDocument(${doc.id})">
                    <i class="fas fa-eye"></i> Consulter
                </button>
                <button class="doc-btn download" onclick="TrainingDocumentsModule.downloadDocument(${doc.id})">
                    <i class="fas fa-download"></i> Télécharger
                </button>
            `;

            if (SimpleAuth.isLoggedIn()) {
                actionsHTML += `
                    <button class="doc-btn delete" onclick="TrainingDocumentsModule.deleteDocument(${doc.id})">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                `;
            }

            docItem.innerHTML = `
                <div class="doc-icon ${ext}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="doc-info">
                    <h3>${doc.title}</h3>
                    ${doc.description ? `<p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">${doc.description}</p>` : ''}
                    <span class="doc-category">${categoryNames[doc.category] || doc.category}</span>
                    <div class="doc-meta">
                        <span><i class="fas fa-file"></i> ${fileSize}</span>
                        <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
                        <span><i class="fas fa-user"></i> ${doc.uploadedBy}</span>
                        <span><i class="fas fa-download"></i> ${doc.downloads || 0} téléchargement(s)</span>
                    </div>
                </div>
                <div class="doc-actions">
                    ${actionsHTML}
                </div>
            `;

            documentsList.appendChild(docItem);
        });
    },

    // View document in modal
    viewDocument: function(docId) {
        const documents = DataManager.getTrainingDocuments();
        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            UIModule.showToast('Document non trouvé', 'error');
            return;
        }

        const modal = document.getElementById('document-viewer-modal');
        const titleElement = document.getElementById('viewer-doc-title');
        const bodyElement = document.getElementById('viewer-body');
        const downloadBtn = document.getElementById('viewer-download-btn');

        if (!modal || !titleElement || !bodyElement) return;

        // Get file extension
        const ext = doc.fileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

        // Set title with appropriate icon
        let iconClass = 'fa-file';
        if (isImage) iconClass = 'fa-file-image';
        else if (isVideo) iconClass = 'fa-file-video';
        else if (ext === 'pdf') iconClass = 'fa-file-pdf';
        else if (['ppt', 'pptx'].includes(ext)) iconClass = 'fa-file-powerpoint';
        else if (['doc', 'docx'].includes(ext)) iconClass = 'fa-file-word';

        titleElement.innerHTML = `<i class="fas ${iconClass}"></i> ${doc.title}`;

        // Show loading
        bodyElement.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Chargement du document...</p>
            </div>
        `;

        // Open modal using Bootstrap
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Load document based on type
        setTimeout(() => {
            if (ext === 'pdf') {
                // For PDF, use iframe with base64 data
                bodyElement.innerHTML = `
                    <iframe src="${doc.fileData}" type="application/pdf" style="width: 100%; height: 100%; border: none;"></iframe>
                `;
            } else if (isImage) {
                // For images, display directly
                bodyElement.innerHTML = `
                    <div class="image-viewer">
                        <img src="${doc.fileData}" alt="${doc.title}" />
                    </div>
                `;
            } else if (isVideo) {
                // For videos, use video player
                bodyElement.innerHTML = `
                    <div class="video-viewer">
                        <video controls>
                            <source src="${doc.fileData}" type="${doc.fileType}">
                            Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                    </div>
                `;
            } else if (['ppt', 'pptx', 'doc', 'docx'].includes(ext)) {
                // For Office documents, show notice with options
                const docTypeName = ['ppt', 'pptx'].includes(ext) ? 'PowerPoint' : 'Word';
                bodyElement.innerHTML = `
                    <div class="ppt-viewer-notice">
                        <i class="fas fa-file-${['ppt', 'pptx'].includes(ext) ? 'powerpoint' : 'word'}"></i>
                        <h3>Visualisation ${docTypeName}</h3>
                        <p>Les fichiers ${docTypeName} ne peuvent pas être visualisés directement dans le navigateur.</p>
                        <p><strong>Options disponibles :</strong></p>
                        <ul style="text-align: left; display: inline-block; margin-bottom: 1rem;">
                            <li>Téléchargez le fichier pour l'ouvrir avec ${docTypeName}</li>
                        </ul>
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <button class="viewer-btn download" onclick="TrainingDocumentsModule.downloadDocument(${doc.id})">
                                <i class="fas fa-download"></i> Télécharger
                            </button>
                        </div>
                    </div>
                `;
            }
        }, 500);

        // Setup download button in footer
        downloadBtn.onclick = () => this.downloadDocument(docId);

        // Setup close buttons
        this.setupViewerCloseHandlers();
    },

    // Open PowerPoint with Google Docs Viewer
    openWithGoogleViewer: function(docId) {
        UIModule.showToast('Pour utiliser Google Docs Viewer, le fichier doit être hébergé sur un serveur web public. Veuillez télécharger le fichier.', 'info');
        this.downloadDocument(docId);
    },

    // Setup viewer close handlers
    setupViewerCloseHandlers: function() {
        const modal = document.getElementById('document-viewer-modal');
        const closeBtn = document.getElementById('close-viewer');
        const closeBtnFooter = document.getElementById('viewer-close-btn');

        const closeViewer = () => {
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            }
        };

        if (closeBtn) {
            closeBtn.onclick = closeViewer;
        }

        if (closeBtnFooter) {
            closeBtnFooter.onclick = closeViewer;
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
                closeViewer();
            }
        });

        // Close on background click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeViewer();
                }
            });
        }
    },

    // Download document
    downloadDocument: function(docId) {
        const documents = DataManager.getTrainingDocuments();
        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            UIModule.showToast('Document non trouvé', 'error');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            link.href = doc.fileData;
            link.download = doc.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Increment download count
            DataManager.incrementDownloadCount(docId);
            this.displayDocuments();

            UIModule.showToast(`Téléchargement de ${doc.fileName}`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            UIModule.showToast('Erreur lors du téléchargement', 'error');
        }
    },

    // Delete document
    deleteDocument: function(docId) {
        if (!SimpleAuth.isLoggedIn()) {
            UIModule.showToast('Vous devez être connecté pour supprimer un document', 'error');
            return;
        }

        const documents = DataManager.getTrainingDocuments();
        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            UIModule.showToast('Document non trouvé', 'error');
            return;
        }

        if (UIModule.showConfirmation(`Êtes-vous sûr de vouloir supprimer le document "${doc.title}" ?`)) {
            const deleted = DataManager.deleteTrainingDocument(docId);

            if (deleted) {
                ActivityModule.addActivity({
                    type: 'training_delete',
                    title: 'Document de formation supprimé',
                    description: doc.title,
                    icon: 'trash',
                    user: SimpleAuth.getCurrentUser()
                });

                UIModule.showToast('Document supprimé avec succès', 'success');
                this.displayDocuments();
            } else {
                UIModule.showToast('Erreur lors de la suppression', 'error');
            }
        }
    },

    // Format file size
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Update UI based on authentication status
    updateUIBasedOnAuth: function() {
        this.setupUploadButton();
        this.displayDocuments();
    }
};
