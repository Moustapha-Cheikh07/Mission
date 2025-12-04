const winston = require('winston');
const path = require('path');

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, module, stack }) => {
        const moduleInfo = module ? `[${module}]` : '';
        const stackTrace = stack ? `\n${stack}` : '';
        return `${timestamp} ${level.toUpperCase()} ${moduleInfo} ${message}${stackTrace}`;
    })
);

// Configuration des transports (où les logs sont envoyés)
const transports = [
    // Logs de niveau 'error' et plus dans error.log
    new winston.transports.File({
        filename: path.join(__dirname, 'logs', 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // Tous les logs dans combined.log
    new winston.transports.File({
        filename: path.join(__dirname, 'logs', 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // Afficher aussi dans la console (toujours activé)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            customFormat
        )
    })
];

// Créer le logger principal
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports: transports,
    exitOnError: false,
});

// Fonction helper pour créer un logger par module
function createModuleLogger(moduleName) {
    return {
        info: (message, meta = {}) => logger.info(message, { module: moduleName, ...meta }),
        warn: (message, meta = {}) => logger.warn(message, { module: moduleName, ...meta }),
        error: (message, meta = {}) => logger.error(message, { module: moduleName, ...meta }),
        debug: (message, meta = {}) => logger.debug(message, { module: moduleName, ...meta }),
    };
}

module.exports = {
    logger,
    createModuleLogger
};
