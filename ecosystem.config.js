module.exports = {
    apps: [{
        name: 'dashboard-qualite',
        script: './backend/server.js',
        cwd: process.cwd(),
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env_production: {
            NODE_ENV: 'production',
            HOST: '0.0.0.0',
            PORT: 1880,
            EXCEL_FILE_PATH: 'sap_export.xlsx'
        },
        error_file: './logs/error.log',
        out_file: './logs/output.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,
        time: true
    }]
};
