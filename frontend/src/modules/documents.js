// ===========================================
// QUALITY DOCUMENTS MODULE - Professional document management system
// ===========================================
const DocumentsModule = {
    currentMachineFilter: 'all', // Track current filter

    init: async function() {
        this.setupUploadButton();
        this.setupUploadForm();
        await this.generateMachineTabs();
        this.populateMachineSelects();
        await this.displayDocuments();
        this.setupSearch();
        this.updateUIBasedOnAuth();

        // Listen for auth state changes
        window.addEventListener('authStateChanged', () => {
            this.updateUIBasedOnAuth();
        });
    },

    // Generate machine tabs
    generateMachineTabs: async function() {
        const tabsContainer = document.getElementById('machine-tabs-container');
        if (!tabsContainer) return;

        const machines = DataManager.getMSMachines();

        if (machines.length === 0) {
            tabsContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #64748b; grid-column: 1 / -1;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p>Aucune machine disponible. Veuillez d'abord ajouter des données de rebuts.</p>
                </div>
            `;
            this.updateHeaderStats(0, 0);
            return;
        }

        // Clear existing tabs
        tabsContainer.innerHTML = '';

        // Calculate total documents
        let totalDocs = 0;

        // Create tab for each machine (Bootstrap cards)
        for (const [index, machine] of machines.entries()) {
            const documents = await DataManager.getDocumentsByMachine(machine);
            totalDocs += documents.length;

            // Create column wrapper
            const col = document.createElement('div');
            col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';

            const tab = document.createElement('button');
            tab.className = 'machine-tab btn w-100 h-100 d-flex flex-column align-items-center justify-content-center gap-1 p-2 border rounded-3 transition-all';
            tab.dataset.machine = machine;

            // First tab is active by default
            if (index === 0) {
                tab.classList.add('active', 'btn-success');
                this.currentMachineFilter = machine;
            } else {
                tab.classList.add('btn-outline-secondary', 'bg-white');
            }

            tab.innerHTML = `
                <div class="machine-tab-icon rounded-circle d-flex align-items-center justify-content-center mb-1" style="width: 36px; height: 36px;">
                    <i class="fas fa-industry"></i>
                </div>
                <span class="machine-tab-name fw-bold small">${machine}</span>
                <span class="machine-tab-count badge ${index === 0 ? 'bg-white text-success' : 'bg-success bg-opacity-10 text-success'} rounded-pill">${documents.length} doc(s)</span>
            `;

            tab.addEventListener('click', () => {
                this.selectMachineTab(machine);
            });

            col.appendChild(tab);
            tabsContainer.appendChild(col);
        }

        // Update header stats
        this.updateHeaderStats(machines.length, totalDocs);

        // Update tab info
        this.updateTabInfo();
    },

    // Update header statistics
    updateHeaderStats: function(machineCount, docCount) {
        const machinesCountEl = document.getElementById('total-machines-count');
        const docsCountEl = document.getElementById('total-docs-count');

        if (machinesCountEl) machinesCountEl.textContent = machineCount;
        if (docsCountEl) docsCountEl.textContent = docCount;
    },

    // Select machine tab
    selectMachineTab: async function(machine) {
        this.currentMachineFilter = machine;

        // Update active tab (Bootstrap classes)
        const tabs = document.querySelectorAll('.machine-tab');
        tabs.forEach(tab => {
            const badge = tab.querySelector('.machine-tab-count');
            if (tab.dataset.machine === machine) {
                tab.classList.add('active', 'btn-success');
                tab.classList.remove('btn-outline-secondary', 'bg-white');
                if (badge) {
                    badge.classList.remove('bg-success', 'bg-opacity-10', 'text-success');
                    badge.classList.add('bg-white', 'text-success');
                }
            } else {
                tab.classList.remove('active', 'btn-success');
                tab.classList.add('btn-outline-secondary', 'bg-white');
                if (badge) {
                    badge.classList.add('bg-success', 'bg-opacity-10', 'text-success');
                    badge.classList.remove('bg-white');
                }
            }
        });

        // Update display
        await this.displayDocuments();
        this.updateTabInfo();

        // Scroll to documents smoothly
        const documentsSection = document.querySelector('.training-documents-section');
        if (documentsSection) {
            documentsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    // Update tab info display
    updateTabInfo: async function() {
        const tabInfo = document.getElementById('machine-tab-info');
        const tabCount = document.getElementById('machine-tab-count');
        const tabName = document.getElementById('machine-tab-name');

        if (!tabInfo || !tabCount || !tabName) return;

        if (this.currentMachineFilter) {
            const documents = await DataManager.getDocumentsByMachine(this.currentMachineFilter);
            tabCount.textContent = documents.length;
            tabName.textContent = this.currentMachineFilter;
            tabInfo.style.display = 'block';
        } else {
            tabInfo.style.display = 'none';
        }
    },

    // Refresh tabs (call after adding/deleting documents)
    refreshTabs: async function() {
        const tabs = document.querySelectorAll('.machine-tab');
        let totalDocs = 0;

        for (const tab of tabs) {
            const machine = tab.dataset.machine;
            const documents = await DataManager.getDocumentsByMachine(machine);
            totalDocs += documents.length;
            const countElement = tab.querySelector('.machine-tab-count');
            if (countElement) {
                countElement.textContent = `${documents.length} doc(s)`;
            }
        }

        // Update header stats
        this.updateHeaderStats(tabs.length, totalDocs);
        this.updateTabInfo();
    },

    // Populate machine select dropdowns
    populateMachineSelects: function() {
        const machines = DataManager.getMSMachines();

        // Populate upload form dropdown
        const uploadMachineSelect = document.getElementById('doc-upload-machine');
        if (uploadMachineSelect) {
            // Clear all existing options
            uploadMachineSelect.innerHTML = '<option value="">Sélectionner une machine</option>';

            // Add machine options
            machines.forEach(machine => {
                const option = document.createElement('option');
                option.value = machine;
                option.textContent = machine;
                uploadMachineSelect.appendChild(option);
            });
        }
    },

    // Setup upload button visibility based on authentication
    setupUploadButton: function() {
        const headerActions = document.getElementById('documents-header-actions');
        console.log('🔍 [Documents] setupUploadButton appelé');
        console.log('  - headerActions existe?', !!headerActions);
        console.log('  - SimpleAuth.isLoggedIn():', SimpleAuth.isLoggedIn());

        if (!headerActions) {
            console.warn('❌ [Documents] Element documents-header-actions non trouvé');
            return;
        }

        if (SimpleAuth.isLoggedIn()) {
            console.log('✅ [Documents] Utilisateur connecté, ajout du bouton');
            headerActions.innerHTML = `
                <button class="add-doc-btn" id="show-doc-upload-btn">
                    <i class="fas fa-plus"></i>
                    Ajouter un document
                </button>
            `;

            const showUploadBtn = document.getElementById('show-doc-upload-btn');
            if (showUploadBtn) {
                showUploadBtn.addEventListener('click', () => this.showUploadForm());
            }
        } else {
            console.log('❌ [Documents] Utilisateur non connecté, pas de bouton');
            headerActions.innerHTML = '';
        }
    },

    // Show/hide upload form
    showUploadForm: function() {
        const uploadSection = document.getElementById('doc-admin-upload-section');
        if (uploadSection) {
            // Populate machine select when showing form
            this.populateMachineSelects();
            uploadSection.style.display = 'block';
            uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
    },

    hideUploadForm: function() {
        const uploadSection = document.getElementById('doc-admin-upload-section');
        if (uploadSection) {
            uploadSection.style.display = 'none';
        }
    },

    // Setup upload form handlers
    setupUploadForm: function() {
        const uploadForm = document.getElementById('doc-upload-form');
        const fileInput = document.getElementById('doc-upload-file');
        const fileName = document.getElementById('doc-file-name');
        const cancelBtn = document.getElementById('cancel-doc-upload');

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
        const fileInput = document.getElementById('doc-upload-file');
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
                title: document.getElementById('doc-upload-title').value,
                category: document.getElementById('doc-upload-category').value,
                machine: document.getElementById('doc-upload-machine').value,
                description: document.getElementById('doc-upload-description').value || '',
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileData: base64
            };

            // Save to storage
            const saved = await DataManager.addQualityDocument(docData);

            if (saved) {
                // Add activity
                const categoryNames = {
                    'control': 'Contrôle qualité',
                    'audit': 'Audit',
                    'procedure': 'Procédure',
                    'nc': 'Non-conformité',
                    'report': 'Rapport',
                    'certificate': 'Certificat',
                    'plan': 'Plan de contrôle',
                    'analysis': 'Analyse',
                    'other': 'Autre'
                };

                ActivityModule.addActivity({
                    type: 'document_upload',
                    title: 'Document qualité ajouté',
                    description: `${docData.title} - ${categoryNames[docData.category]}`,
                    icon: 'file-upload',
                    user: SimpleAuth.getCurrentUser()
                });

                // Success
                UIModule.showToast('Document uploadé avec succès !', 'success');
                form.reset();
                document.getElementById('doc-file-name').textContent = 'Aucun fichier sélectionné';
                this.hideUploadForm();
                this.refreshTabs(); // Refresh tab counts
                await this.displayDocuments();
                UIModule.updateStats(); // Update document count
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

    // Display quality documents
    displayDocuments: async function() {
        const documentsGrid = document.getElementById('documents-grid');
        if (!documentsGrid) return;

        // Get documents filtered by machine
        const documents = await DataManager.getDocumentsByMachine(this.currentMachineFilter);

        if (documents.length === 0) {
            documentsGrid.innerHTML = `
                <div class="empty-docs" style="grid-column: 1/-1;">
                    <i class="fas fa-folder-open"></i>
                    <p>Aucun document qualité disponible pour le moment</p>
                    ${SimpleAuth.isLoggedIn() ? '<p><small>Utilisez le bouton ci-dessus pour ajouter des documents</small></p>' : ''}
                </div>
            `;
            return;
        }

        documentsGrid.innerHTML = '';

        documents.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'quality-doc-item';

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
                'control': 'Contrôle qualité',
                'audit': 'Audit',
                'procedure': 'Procédure',
                'nc': 'Non-conformité',
                'report': 'Rapport',
                'certificate': 'Certificat',
                'plan': 'Plan de contrôle',
                'analysis': 'Analyse',
                'other': 'Autre'
            };

            // Format file size
            const fileSize = this.formatFileSize(doc.fileSize);

            // Format upload date
            const uploadDate = Utils.formatDate(doc.uploadDate);

            // Build actions based on authentication
            let actionsHTML = `
                <button class="doc-btn view" onclick="DocumentsModule.viewDocument(${doc.id})">
                    <i class="fas fa-eye"></i> Consulter
                </button>
                <button class="doc-btn download" onclick="DocumentsModule.downloadDocument(${doc.id})">
                    <i class="fas fa-download"></i> Télécharger
                </button>
            `;

            if (SimpleAuth.isLoggedIn()) {
                actionsHTML += `
                    <button class="doc-btn edit" onclick="DocumentsModule.editDocument(${doc.id})">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="doc-btn delete" onclick="DocumentsModule.deleteDocument(${doc.id})">
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
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
                        <span class="doc-category">${categoryNames[doc.category] || doc.category}</span>
                        ${doc.machine ? `<span class="doc-category" style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);"><i class="fas fa-industry"></i> ${doc.machine}</span>` : ''}
                    </div>
                    <div class="doc-meta">
                        <span><i class="fas fa-file"></i> ${fileSize}</span>
                        <span><i class="fas fa-calendar"></i> ${uploadDate}</span>
                        <span><i class="fas fa-user"></i> ${doc.uploadedBy}</span>
                        <span><i class="fas fa-download"></i> ${doc.downloads || 0} téléchargement(s)</span>
                        <span><i class="fas fa-eye"></i> ${doc.views || 0} vue(s)</span>
                    </div>
                </div>
                <div class="doc-actions">
                    ${actionsHTML}
                </div>
            `;

            documentsGrid.appendChild(docItem);
        });
    },

    // View document in modal
    viewDocument: async function(docId) {
        const documents = DataManager.getDocuments();
        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            UIModule.showToast('Document non trouvé', 'error');
            return;
        }

        const modal = document.getElementById('quality-document-viewer-modal');
        const titleElement = document.getElementById('quality-viewer-doc-title');
        const bodyElement = document.getElementById('quality-viewer-body');
        const downloadBtn = document.getElementById('quality-viewer-download-btn');

        if (!modal || !titleElement || !bodyElement) return;

        // Increment view count
        DataManager.incrementQualityDocumentViews(docId);
        await this.displayDocuments();

        // Get file extension
        const ext = doc.fileName.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

        // Set title
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
                // PDF viewer
                bodyElement.innerHTML = `
                    <iframe src="${doc.fileData}" type="application/pdf"></iframe>
                `;
            } else if (isImage) {
                // Image viewer
                bodyElement.innerHTML = `
                    <div class="image-viewer">
                        <img src="${doc.fileData}" alt="${doc.title}" />
                    </div>
                `;
            } else if (isVideo) {
                // Video viewer
                bodyElement.innerHTML = `
                    <div class="video-viewer">
                        <video controls>
                            <source src="${doc.fileData}" type="${doc.fileType}">
                            Votre navigateur ne supporte pas la lecture de vidéos.
                        </video>
                    </div>
                `;
            } else if (['ppt', 'pptx', 'doc', 'docx'].includes(ext)) {
                // Office documents
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
                            <button class="viewer-btn download" onclick="DocumentsModule.downloadDocument(${doc.id})">
                                <i class="fas fa-download"></i> Télécharger
                            </button>
                        </div>
                    </div>
                `;
            }
        }, 500);

        // Setup download button in footer
        downloadBtn.onclick = () => this.downloadDocument(docId);

        // Setup close handlers
        this.setupViewerCloseHandlers('quality-document-viewer-modal', 'quality-close-viewer', 'quality-viewer-close-btn');
    },

    // Setup viewer close handlers
    setupViewerCloseHandlers: function(modalId, closeBtnId, closeBtnFooterId) {
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeBtnId);
        const closeBtnFooter = document.getElementById(closeBtnFooterId);

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

        // Bootstrap handles Escape and background click automatically
    },

    // Download document
    downloadDocument: async function(docId) {
        const documents = DataManager.getDocuments();
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
            DataManager.incrementQualityDocumentDownloads(docId);
            await this.displayDocuments();

            UIModule.showToast(`Téléchargement de ${doc.fileName}`, 'success');
        } catch (error) {
            console.error('Download error:', error);
            UIModule.showToast('Erreur lors du téléchargement', 'error');
        }
    },

    // Edit document (simplified - just change title/description/category)
    editDocument: async function(docId) {
        if (!SimpleAuth.isLoggedIn()) {
            UIModule.showToast('Vous devez être connecté pour modifier un document', 'error');
            return;
        }

        const documents = DataManager.getDocuments();
        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            UIModule.showToast('Document non trouvé', 'error');
            return;
        }

        const newTitle = prompt('Nouveau titre:', doc.title);
        if (!newTitle || newTitle === doc.title) return;

        const newDescription = prompt('Nouvelle description:', doc.description || '');

        const updated = DataManager.updateQualityDocument(docId, {
            title: newTitle,
            description: newDescription
        });

        if (updated) {
            UIModule.showToast('Document modifié avec succès', 'success');
            await this.displayDocuments();
        } else {
            UIModule.showToast('Erreur lors de la modification', 'error');
        }
    },

    // Delete document
    deleteDocument: async function(docId) {
        if (!SimpleAuth.isLoggedIn()) {
            UIModule.showToast('Vous devez être connecté pour supprimer un document', 'error');
            return;
        }

        const documents = DataManager.getDocuments();
        const doc = documents.find(d => d.id === docId);

        if (!doc) {
            UIModule.showToast('Document non trouvé', 'error');
            return;
        }

        if (UIModule.showConfirmation(`Êtes-vous sûr de vouloir supprimer le document "${doc.title}" ?`)) {
            const deleted = await DataManager.deleteQualityDocument(docId);

            if (deleted) {
                ActivityModule.addActivity({
                    type: 'document_delete',
                    title: 'Document qualité supprimé',
                    description: doc.title,
                    icon: 'trash',
                    user: SimpleAuth.getCurrentUser()
                });

                UIModule.showToast('Document supprimé avec succès', 'success');
                this.refreshTabs(); // Refresh tab counts
                await this.displayDocuments();
                UIModule.updateStats(); // Update document count
            } else {
                UIModule.showToast('Erreur lors de la suppression', 'error');
            }
        }
    },

    // Setup search functionality
    setupSearch: function() {
        const searchInput = document.getElementById('document-search');
        if (!searchInput) return;

        const debouncedSearch = Utils.debounce((e) => {
            const searchTerm = e.target.value.toLowerCase();
            const documentItems = document.querySelectorAll('.quality-doc-item');

            documentItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? 'grid' : 'none';
            });
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
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
    updateUIBasedOnAuth: async function() {
        this.setupUploadButton();
        this.populateMachineSelects();
        await this.generateMachineTabs();
        await this.displayDocuments();
    }
};
