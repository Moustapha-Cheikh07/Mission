document.addEventListener('DOMContentLoaded', function () {
    // Initialize data manager
    DataManager.init();

    // Initialize all modules
    AuthModule.init();
    NavigationModule.init();
    // Initialize Data Connector module
    if (typeof DataConnectorModule !== 'undefined') {
        DataConnectorModule.init();
    }
    UIModule.updateDateDisplay();
    UIModule.updateStats();
    ActivityModule.init(); // Initialize recent activities
    ResultsModule.init();
    DocumentsModule.init();
    FormsModule.init();
    TrainingDocumentsModule.init(); // Initialize training documents system
    RejectAnalysis.init(); // Initialize reject analysis system
    ChartModule.init();

    console.log('Merlin Gerin Quality Dashboard initialized successfully');
});