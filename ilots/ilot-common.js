/**
 * Common JavaScript functionality for all Ilot pages
 * Handles metrics display, objectives, filtering, and data loading
 */

// Global variables for charts
let rejectsByMachineChart = null;
let rejectsByReasonChart = null;
let productionChart = null;
let allData = null; // Store all data for filtering

// Initialize date filters to last month (default period)
function initializeDateFilters() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    document.getElementById('end-date').valueAsDate = endDate;
    document.getElementById('start-date').valueAsDate = startDate;
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    document.getElementById('current-date').textContent =
        now.toLocaleDateString('fr-FR', options);
}

// Format number with spaces
function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Format currency
function formatCurrency(num) {
    return formatNumber(num) + ' €';
}

// Animate number counting
function animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }

        // Format based on element id
        if (element.id === 'reject-rate') {
            element.textContent = current.toFixed(2) + '%';
        } else if (element.id === 'reject-value') {
            element.textContent = formatCurrency(current);
        } else {
            element.textContent = formatNumber(current);
        }
    }, 16);
}

// Update objectives status based on current values
function updateObjectives() {
    const quantity = parseInt(document.getElementById('reject-quantity').textContent) || 0;
    const rate = parseFloat(document.getElementById('reject-rate').textContent) || 0;
    const value = parseInt(document.getElementById('reject-value').textContent.replace(/[€\s]/g, '')) || 0;

    const objQuantity = parseInt(document.getElementById('objective-quantity').value) || 0;
    const objRate = parseFloat(document.getElementById('objective-rate').value) || 0;
    const objValue = parseInt(document.getElementById('objective-value').value) || 0;

    // Update quantity status
    const statusQty = document.getElementById('status-quantity');
    if (quantity <= objQuantity) {
        statusQty.textContent = '✓ Objectif atteint';
        statusQty.className = 'metric-status success';
    } else {
        statusQty.textContent = '✗ Objectif dépassé';
        statusQty.className = 'metric-status danger';
    }

    // Update rate status
    const statusRate = document.getElementById('status-rate');
    if (rate <= objRate) {
        statusRate.textContent = '✓ Objectif atteint';
        statusRate.className = 'metric-status success';
    } else {
        statusRate.textContent = '✗ Objectif dépassé';
        statusRate.className = 'metric-status danger';
    }

    // Update value status
    const statusValue = document.getElementById('status-value');
    if (value <= objValue) {
        statusValue.textContent = '✓ Objectif atteint';
        statusValue.className = 'metric-status success';
    } else {
        statusValue.textContent = '✗ Objectif dépassé';
        statusValue.className = 'metric-status danger';
    }
}

// Apply date filter automatically
function applyFilter() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!startDate || !endDate) {
        return;
    }

    console.log('Filtrage de', startDate, 'à', endDate);
    // Reload data with filter
    loadIlotData();
}

// Auto-apply filter when dates change
function setupAutoFilter() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');

    if (startDateInput && endDateInput) {
        startDateInput.addEventListener('change', applyFilter);
        endDateInput.addEventListener('change', applyFilter);
    }
}

// Load ilot data from API
async function loadIlotData() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Erreur réseau: ' + response.status);
        }

        const data = await response.json();

        console.log('Data received:', data); // Debug

        if (!data.success) {
            throw new Error(data.error || 'Erreur lors du chargement des données');
        }

        allData = data; // Store for filtering

        // Update last update time
        if (data.lastUpdate) {
            document.getElementById('last-update').textContent = data.lastUpdate;
        }

        // Update the 3 main metrics - handle different data structures
        const stats = data.stats || {};
        const summary = stats.summary || {};

        const rejectQty = summary.totalRejectQuantity || 0;
        const rejectRate = summary.rejectRate || 0;
        const rejectCost = summary.totalRejectCost || 0;

        console.log('Metrics:', { rejectQty, rejectRate, rejectCost }); // Debug

        // Animate numbers for better UX
        const qtyElement = document.getElementById('reject-quantity');
        const rateElement = document.getElementById('reject-rate');
        const valueElement = document.getElementById('reject-value');

        animateNumber(qtyElement, 0, rejectQty, 1200);
        animateNumber(rateElement, 0, rejectRate, 1200);
        animateNumber(valueElement, 0, rejectCost, 1200);

        // Update objectives status
        updateObjectives();

        // Show content, hide loading
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

    } catch (error) {
        console.error('Error loading ilot data:', error);
        document.getElementById('loading').innerHTML =
            '<div class="loading-text" style="color: #f5576c;">❌ Erreur: ' + error.message + '</div>';
    }
}

// Initialize page on load
function initializeIlotPage() {
    updateCurrentDate();
    initializeDateFilters();
    setupAutoFilter(); // Enable automatic filtering
    loadIlotData();

    // Update date every minute
    setInterval(updateCurrentDate, 60000);
}
