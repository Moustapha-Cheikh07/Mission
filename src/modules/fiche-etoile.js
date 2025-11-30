// Fiche Étoile Module
const FicheEtoileModule = {
    fiches: [],
    API_URL: 'http://localhost:3000/api/fiches-etoile',

    init: function() {
        console.log('Fiche Étoile module initializing...');
        this.loadFichesFromServer();
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        // Form submit
        const form = document.getElementById('fiche-etoile-form');
        if (form) {
            // Disable HTML5 validation completely
            form.setAttribute('novalidate', 'novalidate');

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.submitFiche();
                return false;
            });
        }

        // Preview button
        const previewBtn = document.getElementById('preview-fiche-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                this.previewFiche();
                return false;
            });
        }

        // Print button (in form) - Removed from form, only available for saved fiches
        const printBtn = document.getElementById('print-fiche-btn');
        if (printBtn) {
            printBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.printFiche();
            });
        }

        // Download Excel button (in form) - Removed from form, only available for saved fiches
        const downloadExcelBtn = document.getElementById('download-excel-btn');
        if (downloadExcelBtn) {
            downloadExcelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.downloadExcel();
            });
        }

        // Print button (in modal)
        const printModalBtn = document.getElementById('fiche-print-modal-btn');
        if (printModalBtn) {
            printModalBtn.addEventListener('click', () => this.printFromModal());
        }

        // Close modal buttons
        const closeBtn = document.getElementById('close-fiche-modal');
        const closeModalBtn = document.getElementById('fiche-close-modal-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        // Close on background click
        const modal = document.getElementById('fiche-etoile-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('fiches-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchFiches(e.target.value));
        }
    },

    getFormData: function() {
        return {
            reference: document.getElementById('fiche-reference').value,
            emetteur: document.getElementById('fiche-emetteur').value,
            dateFabrication: document.getElementById('fiche-date-fabrication').value,
            date: document.getElementById('fiche-date').value,
            quantite: document.getElementById('fiche-quantite').value,
            avisQualite: document.getElementById('fiche-avis-qualite').value,
            description: document.getElementById('fiche-description').value,
            actions: document.getElementById('fiche-actions').value,
            delai: document.getElementById('fiche-delai').value
        };
    },

    // Convert ISO date (YYYY-MM-DD) to French format (DD/MM/YYYY)
    convertISOtoFrench: function(isoDate) {
        if (!isoDate) return '';
        const parts = isoDate.split('-');
        if (parts.length !== 3) return isoDate;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },

    // Convert French date (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
    convertFrenchToISO: function(frenchDate) {
        if (!frenchDate) return '';
        const parts = frenchDate.split('/');
        if (parts.length !== 3) return frenchDate;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    },

    validateForm: function() {
        const data = this.getFormData();
        const errorMessage = document.getElementById('fiche-error-message');
        const errorText = document.getElementById('fiche-error-text');

        // Check required fields
        if (!data.reference || !data.emetteur || !data.dateFabrication ||
            !data.date || !data.quantite || !data.description ||
            !data.actions || !data.delai) {

            if (errorText) errorText.textContent = 'Veuillez remplir tous les champs obligatoires';
            if (errorMessage) {
                errorMessage.style.display = 'block';
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 5000);
            }

            this.showMessage('Veuillez remplir tous les champs obligatoires', 'warning');
            return false;
        }

        // Hide error message if validation passes
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }

        return true;
    },

    formatDate: function(dateStr) {
        if (!dateStr) return '';

        // If already in DD/MM/YYYY format, return as is
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            return dateStr;
        }

        // If in ISO format (YYYY-MM-DD), convert to French
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return this.convertISOtoFrench(dateStr);
        }

        // Otherwise, try to parse as date
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // Return original if invalid

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    },

    generateFicheHTML: function(data) {
        return `
            <div class="fiche-etoile-document">
                <!-- Green Header -->
                <div class="fiche-green-header">
                    <h2>Fiche Étoile - Produit Défectueux</h2>
                </div>

                <!-- Title Section -->
                <div class="fiche-title-section">
                    <div class="fiche-title-icon">
                        <img src="assets/images/merlin-gerin-logo.png" alt="Merlin Gerin Logo" style="width: 100%; height: auto; max-width: 120px;">
                    </div>
                    <h1 class="fiche-main-title">Fiche Étoile<br>- Produit Défectueux</h1>
                </div>

                <!-- Header Row -->
                <div class="fiche-header-row">
                    <div class="fiche-box">
                        <h3>Référence :</h3>
                        <p>${data.reference}</p>
                        <h3 style="margin-top: 1rem;">Date de fabrication :</h3>
                        <p>${this.formatDate(data.dateFabrication)}</p>
                        <h3 style="margin-top: 1rem;">Quantité :</h3>
                        <p>${data.quantite}</p>
                    </div>
                    <div class="fiche-box">
                        <h3>Émetteur :</h3>
                        <p>${data.emetteur}</p>
                        <h3 style="margin-top: 1rem;">Date :</h3>
                        <p>${this.formatDate(data.date)}</p>
                        <h3 style="margin-top: 1rem;">N° avis qualité :</h3>
                        <p>${data.avisQualite || 'N/A'}</p>
                    </div>
                </div>

                <!-- Content Row -->
                <div class="fiche-content-row">
                    <div class="fiche-logo-box">
                        <h2>Produit<br>défectueux</h2>
                        <div class="warning-triangle">
                            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                <!-- White border -->
                                <path d="M100 20 L180 170 L20 170 Z" fill="white" stroke="white" stroke-width="8"/>
                                <!-- Red triangle -->
                                <path d="M100 30 L170 160 L30 160 Z" fill="#ef4444" stroke="white" stroke-width="4"/>
                                <!-- Exclamation mark -->
                                <rect x="95" y="70" width="10" height="50" fill="black" rx="2"/>
                                <circle cx="100" cy="135" r="7" fill="black"/>
                            </svg>
                        </div>
                    </div>
                    <div class="fiche-description-box">
                        <h3>Description du problème :</h3>
                        <div class="fiche-description-content">${data.description}</div>
                    </div>
                </div>

                <!-- Actions Row -->
                <div class="fiche-actions-row">
                    <div class="fiche-actions-box">
                        <h3>Actions :</h3>
                        <div class="fiche-actions-content">${data.actions}</div>
                    </div>
                    <div class="fiche-actions-box">
                        <h3>Délai :</h3>
                        <div class="fiche-actions-content">${this.formatDate(data.delai)}</div>
                    </div>
                </div>

            </div>
        `;
    },

    previewFiche: function() {
        if (!this.validateForm()) {
            return;
        }

        const data = this.getFormData();
        const ficheHTML = this.generateFicheHTML(data);

        const previewContainer = document.getElementById('fiche-etoile-preview');
        if (previewContainer) {
            previewContainer.innerHTML = ficheHTML;
        }

        // Show modal using Bootstrap
        const modal = document.getElementById('fiche-etoile-modal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    },

    closeModal: function() {
        const modal = document.getElementById('fiche-etoile-modal');
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    },

    printFiche: function() {
        if (!this.validateForm()) {
            return;
        }

        const data = this.getFormData();
        this.generateAndPrintPDF(data, false);
    },

    printFromModal: function() {
        window.print();
    },

    downloadExcel: function() {
        if (!this.validateForm()) {
            return;
        }

        const data = this.getFormData();
        this.generateExcelFile(data);
    },

    generateExcelFile: function(data) {
        // Create workbook
        const wb = XLSX.utils.book_new();

        // Create empty grid (30 rows x 12 columns)
        const wsData = Array(35).fill(null).map(() => Array(12).fill(''));

        // Header boxes (rows 1-5)
        // Left box (columns A-F)
        wsData[0][0] = 'Référence :';
        wsData[1][0] = data.reference;
        wsData[2][0] = 'Date de fabrication :';
        wsData[3][0] = this.formatDate(data.dateFabrication);
        wsData[4][0] = 'Quantité :';
        wsData[5][0] = data.quantite;

        // Right box (columns G-L)
        wsData[0][6] = 'Emetteur :';
        wsData[1][6] = data.emetteur;
        wsData[2][6] = 'Date :';
        wsData[3][6] = this.formatDate(data.date);
        wsData[4][6] = 'N° avis qualité :';
        wsData[5][6] = data.avisQualite || '';

        // Logo box (rows 7-20, columns A-F)
        wsData[7][0] = 'Produit défectueux';
        wsData[12][2] = '⚠️';

        // Description box (rows 7-20, columns G-L)
        wsData[7][6] = 'Description du problème :';
        wsData[21][6] = data.description;

        // Actions box (rows 22-30, columns A-F)
        wsData[22][0] = 'Actions :';
        wsData[24][0] = data.actions;

        // Délai box (rows 22-30, columns G-L)
        wsData[22][6] = 'Délai :';
        wsData[24][6] = this.formatDate(data.delai);

        // Footer
        wsData[32][0] = 'doc N° 3375275 - à jour uniquement sur son support informatique dans SMI commun';

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        ws['!cols'] = [
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
            { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
        ];

        // Set row heights
        ws['!rows'] = Array(35).fill({ hpt: 20 });
        ws['!rows'][8] = { hpt: 25 };
        ws['!rows'][9] = { hpt: 25 };
        ws['!rows'][12] = { hpt: 40 };

        // Merge cells
        ws['!merges'] = [
            // Header left box
            { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Référence label
            { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Référence value
            { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Date fab label
            { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, // Date fab value
            { s: { r: 4, c: 0 }, e: { r: 4, c: 2 } }, // Quantité label
            { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } }, // Quantité value

            // Header right box
            { s: { r: 0, c: 6 }, e: { r: 0, c: 8 } }, // Emetteur label
            { s: { r: 1, c: 6 }, e: { r: 1, c: 8 } }, // Emetteur value
            { s: { r: 2, c: 6 }, e: { r: 2, c: 8 } }, // Date label
            { s: { r: 3, c: 6 }, e: { r: 3, c: 8 } }, // Date value
            { s: { r: 4, c: 6 }, e: { r: 4, c: 8 } }, // N° avis label
            { s: { r: 5, c: 6 }, e: { r: 5, c: 8 } }, // N° avis value

            // Logo box - Title
            { s: { r: 7, c: 0 }, e: { r: 7, c: 2 } }, // Produit défectueux label

            // Logo box - Warning icon area
            { s: { r: 8, c: 0 }, e: { r: 21, c: 2 } }, // Warning icon area

            // Description box
            { s: { r: 7, c: 6 }, e: { r: 7, c: 11 } }, // Description label
            { s: { r: 8, c: 6 }, e: { r: 21, c: 11 } }, // Description content

            // Actions box
            { s: { r: 22, c: 0 }, e: { r: 22, c: 2 } }, // Actions label
            { s: { r: 23, c: 0 }, e: { r: 30, c: 2 } }, // Actions content

            // Délai box
            { s: { r: 22, c: 6 }, e: { r: 22, c: 8 } }, // Délai label
            { s: { r: 23, c: 6 }, e: { r: 30, c: 8 } }, // Délai content

            // Footer
            { s: { r: 32, c: 0 }, e: { r: 32, c: 11 } }
        ];

        // Styles
        const borderStyle = {
            top: { style: 'medium', color: { rgb: '000000' } },
            bottom: { style: 'medium', color: { rgb: '000000' } },
            left: { style: 'medium', color: { rgb: '000000' } },
            right: { style: 'medium', color: { rgb: '000000' } }
        };

        const labelStyle = {
            font: { bold: true, sz: 11 },
            alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
            border: borderStyle
        };

        const valueStyle = {
            font: { sz: 10 },
            alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
            border: borderStyle
        };

        const logoStyle = {
            font: { bold: true, sz: 24, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: 'FBBF24' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderStyle
        };

        const warningStyle = {
            font: { sz: 48, color: { rgb: 'EF4444' } },
            fill: { fgColor: { rgb: 'FBBF24' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: borderStyle
        };

        const descLabelStyle = {
            font: { bold: true, sz: 11 },
            alignment: { horizontal: 'left', vertical: 'top' },
            border: borderStyle
        };

        const descContentStyle = {
            font: { sz: 10 },
            alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
            border: { ...borderStyle, top: { style: 'dotted' } }
        };

        // Apply styles to specific cells
        // Header boxes
        ['A1', 'A3', 'A5', 'G1', 'G3', 'G5'].forEach(cell => {
            if (ws[cell]) ws[cell].s = labelStyle;
        });
        ['A2', 'A4', 'A6', 'G2', 'G4', 'G6'].forEach(cell => {
            if (ws[cell]) ws[cell].s = valueStyle;
        });

        // Logo box
        if (ws['A8']) ws['A8'].s = logoStyle; // "Produit défectueux" title
        if (ws['A9']) ws['A9'].s = warningStyle; // Warning icon area
        if (ws['C13']) ws['C13'].s = warningStyle; // Warning icon

        // Description
        if (ws['G8']) ws['G8'].s = descLabelStyle;
        if (ws['G22']) ws['G22'].s = descContentStyle;

        // Actions
        if (ws['A23']) ws['A23'].s = labelStyle;
        if (ws['A25']) ws['A25'].s = descContentStyle;

        // Délai
        if (ws['G23']) ws['G23'].s = labelStyle;
        if (ws['G25']) ws['G25'].s = valueStyle;

        // Footer
        if (ws['A33']) {
            ws['A33'].s = {
                font: { sz: 9, italic: true },
                alignment: { horizontal: 'center', vertical: 'center' }
            };
        }

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Fiche étoile');

        // Generate filename
        const filename = `Fiche-Etoile-${data.reference}.xlsx`;

        // Save file
        XLSX.writeFile(wb, filename);

        this.showMessage('Fiche téléchargée en Excel avec succès!', 'success');
    },

    generateAndPrintPDF: function(data, download = false) {
        if (download) {
            // Download PDF
            const ficheHTML = this.generateFicheHTML(data);

            // Create temporary container
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = ficheHTML;
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '210mm'; // A4 width
            document.body.appendChild(tempDiv);

            const element = tempDiv.querySelector('.fiche-etoile-document');

            const opt = {
                margin: 10,
                filename: `Fiche-Etoile-${data.reference}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                document.body.removeChild(tempDiv);
                this.showMessage('Fiche téléchargée avec succès!', 'success');
            });
        } else {
            // Print directly from current page - show in modal and use window.print()
            const ficheHTML = this.generateFicheHTML(data);

            const previewContainer = document.getElementById('fiche-etoile-preview');
            if (previewContainer) {
                previewContainer.innerHTML = ficheHTML;
            }

            // Show modal using Bootstrap
            const modal = document.getElementById('fiche-etoile-modal');
            if (modal) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();

                // Wait for content to render and images to load, then print
                setTimeout(() => {
                    // Ensure all images are loaded
                    const images = modal.querySelectorAll('img');
                    const imagePromises = Array.from(images).map(img => {
                        if (img.complete) return Promise.resolve();
                        return new Promise(resolve => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    });

                    Promise.all(imagePromises).then(() => {
                        // Extra small delay to ensure rendering is complete
                        setTimeout(() => {
                            window.print();
                        }, 100);
                    });
                }, 300);
            }
        }
    },

    // Submit and save fiche
    submitFiche: async function() {
        if (!this.validateForm()) {
            return;
        }

        const data = this.getFormData();

        // Prepare fiche data for server
        const ficheData = {
            reference: data.reference,
            emetteur: data.emetteur,
            date_fabrication: data.dateFabrication,
            date: data.date,
            quantite: parseInt(data.quantite),
            avis_qualite: data.avisQualite || '',
            description: data.description,
            actions: data.actions,
            delai: data.delai
        };

        try {
            // Send to server
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ficheData)
            });

            const result = await response.json();

            if (result.success) {
                // Reload fiches from server
                await this.loadFichesFromServer();

                // Reset form
                document.getElementById('fiche-etoile-form').reset();

                // Show success message
                this.showMessage('Fiche Étoile enregistrée avec succès!', 'success');
            } else {
                throw new Error(result.error || 'Erreur lors de l\'enregistrement');
            }

        } catch (error) {
            console.error('Error submitting fiche:', error);
            this.showMessage('Erreur lors de l\'enregistrement de la fiche: ' + error.message, 'danger');
        }
    },

    // Load fiches from server
    loadFichesFromServer: async function() {
        try {
            const response = await fetch(this.API_URL);
            const result = await response.json();

            if (result.success) {
                // Convert server data to match frontend format
                this.fiches = result.data.map(fiche => ({
                    id: fiche.id,
                    reference: fiche.reference,
                    emetteur: fiche.emetteur,
                    dateFabrication: fiche.date_fabrication,
                    date: fiche.date,
                    quantite: fiche.quantite,
                    avisQualite: fiche.avis_qualite,
                    description: fiche.description,
                    actions: fiche.actions,
                    delai: fiche.delai,
                    createdAt: fiche.created_at,
                    createdBy: fiche.emetteur
                }));

                this.displayFiches();
            } else {
                console.error('Error loading fiches from server:', result.error);
                this.fiches = [];
            }
        } catch (error) {
            console.error('Error loading fiches from server:', error);
            this.showMessage('Erreur lors du chargement des fiches', 'warning');
            this.fiches = [];
        }
    },

    // Display fiches list
    displayFiches: function(fichesToDisplay = null) {
        const container = document.getElementById('fiches-list');
        if (!container) return;

        const fiches = fichesToDisplay || this.fiches;

        if (fiches.length === 0) {
            container.innerHTML = `
                <div class="no-documents">
                    <i class="fas fa-inbox"></i>
                    <p>Aucune fiche étoile enregistrée</p>
                </div>
            `;
            return;
        }

        let html = '';
        fiches.forEach(fiche => {
            const date = new Date(fiche.createdAt);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const dateStr = `${day}/${month}/${year}`;
            const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

            html += `
                <div class="document-card" data-fiche-id="${fiche.id}">
                    <div class="document-icon" style="background: linear-gradient(135deg, #fbbf24, #f59e0b);">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="document-info">
                        <h3>${fiche.reference}</h3>
                        <p><strong>Émetteur:</strong> ${fiche.emetteur}</p>
                        <p><strong>Quantité:</strong> ${fiche.quantite}</p>
                        <p class="document-meta">
                            <i class="fas fa-calendar"></i> ${dateStr} ${timeStr}
                            <i class="fas fa-user" style="margin-left: 1rem;"></i> ${fiche.createdBy}
                        </p>
                    </div>
                    <div class="document-actions">
                        <button class="doc-action-btn view" onclick="FicheEtoileModule.viewFiche('${fiche.id}')" title="Visualiser">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="doc-action-btn download" onclick="FicheEtoileModule.downloadSavedFicheExcel('${fiche.id}')" title="Télécharger Excel" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i class="fas fa-file-excel"></i>
                        </button>
                        <button class="doc-action-btn print" onclick="FicheEtoileModule.printSavedFiche('${fiche.id}')" title="Imprimer">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="doc-action-btn delete" onclick="FicheEtoileModule.deleteFiche('${fiche.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Search fiches
    searchFiches: function(query) {
        if (!query.trim()) {
            this.displayFiches();
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = this.fiches.filter(fiche =>
            fiche.reference.toLowerCase().includes(lowerQuery) ||
            fiche.emetteur.toLowerCase().includes(lowerQuery) ||
            fiche.description.toLowerCase().includes(lowerQuery)
        );

        this.displayFiches(filtered);
    },

    // View saved fiche
    viewFiche: function(ficheId) {
        const fiche = this.fiches.find(f => f.id === ficheId);
        if (!fiche) return;

        const ficheHTML = this.generateFicheHTML(fiche);
        const previewContainer = document.getElementById('fiche-etoile-preview');
        if (previewContainer) {
            previewContainer.innerHTML = ficheHTML;
        }

        // Show modal using Bootstrap
        const modal = document.getElementById('fiche-etoile-modal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    },

    // Print saved fiche
    printSavedFiche: function(ficheId) {
        const fiche = this.fiches.find(f => f.id === ficheId);
        if (!fiche) return;

        this.generateAndPrintPDF(fiche, false);
    },

    // Download saved fiche as Excel
    downloadSavedFicheExcel: function(ficheId) {
        const fiche = this.fiches.find(f => f.id === ficheId);
        if (!fiche) return;

        this.generateExcelFile(fiche);
    },

    // Delete fiche
    deleteFiche: async function(ficheId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche étoile?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_URL}/${ficheId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                // Reload fiches from server
                await this.loadFichesFromServer();
                this.showMessage('Fiche étoile supprimée', 'success');
            } else {
                throw new Error(result.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting fiche:', error);
            this.showMessage('Erreur lors de la suppression de la fiche: ' + error.message, 'danger');
        }
    },

    showMessage: function(message, type = 'info') {
        const toast = document.getElementById('message-toast');
        if (toast) {
            toast.textContent = message;
            toast.className = 'toast show ' + type;
            setTimeout(() => {
                toast.className = 'toast';
            }, 4000);
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    FicheEtoileModule.init();
});
