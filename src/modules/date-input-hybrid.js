// Date Input Hybrid Module - Synchronize text input (DD/MM/YYYY) with date picker
const DateInputHybrid = {
    // Convert ISO date (YYYY-MM-DD) to French format (DD/MM/YYYY)
    isoToFrench: function(isoDate) {
        if (!isoDate) return '';
        const parts = isoDate.split('-');
        if (parts.length !== 3) return isoDate;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },

    // Convert French date (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
    frenchToISO: function(frenchDate) {
        if (!frenchDate) return '';
        const parts = frenchDate.split('/');
        if (parts.length !== 3) return frenchDate;

        // Validate the date parts
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
        if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return '';

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    },

    // Validate French date format
    isValidFrenchDate: function(dateStr) {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateStr.match(regex);

        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year < 1900 || year > 2100) return false;

        // Check day validity for specific months
        const daysInMonth = [31, (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day > daysInMonth[month - 1]) return false;

        return true;
    },

    // Setup a single date input pair
    setupDateInput: function(textInputId, pickerInputId) {
        const textInput = document.getElementById(textInputId);
        const pickerInput = document.getElementById(pickerInputId);

        if (!textInput || !pickerInput) {
            console.warn(`Date inputs not found: ${textInputId}, ${pickerInputId}`);
            return;
        }

        // When user types in text input, update picker
        textInput.addEventListener('input', (e) => {
            const frenchDate = e.target.value;
            if (this.isValidFrenchDate(frenchDate)) {
                const isoDate = this.frenchToISO(frenchDate);
                pickerInput.value = isoDate;
            }
        });

        // When user selects from calendar, update text
        pickerInput.addEventListener('change', (e) => {
            const isoDate = e.target.value;
            if (isoDate) {
                const frenchDate = this.isoToFrench(isoDate);
                textInput.value = frenchDate;

                // Trigger input event on text input for form validation
                const event = new Event('input', { bubbles: true });
                textInput.dispatchEvent(event);
            }
        });

        // When clicking on the wrapper, open the date picker
        const wrapper = textInput.closest('.date-input-wrapper');
        if (wrapper) {
            const icon = wrapper.querySelector('.date-calendar-icon');
            if (icon) {
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Enable pointer events temporarily to allow click
                    pickerInput.style.pointerEvents = 'auto';
                    pickerInput.showPicker ? pickerInput.showPicker() : pickerInput.click();
                    // Restore pointer events after a short delay
                    setTimeout(() => {
                        pickerInput.style.pointerEvents = 'none';
                    }, 100);
                });
            }
        }
    },

    // Initialize all date inputs on the page
    init: function() {
        console.log('DateInputHybrid initializing...');

        // Fiche étoile date inputs
        this.setupDateInput('fiche-date-fabrication', 'fiche-date-fabrication-picker');
        this.setupDateInput('fiche-date', 'fiche-date-picker');
        this.setupDateInput('fiche-delai', 'fiche-delai-picker');

        // Reject analysis date inputs
        this.setupDateInput('reject-start-date', 'reject-start-date-picker');
        this.setupDateInput('reject-end-date', 'reject-end-date-picker');

        console.log('DateInputHybrid initialized');
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DateInputHybrid.init();
});
