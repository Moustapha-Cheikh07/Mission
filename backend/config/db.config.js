// MySQL Database Configuration
module.exports = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Medmouna', // Changez ceci avec votre mot de passe MySQL
    database: process.env.DB_NAME || 'merlin_gerin_dashboard',
    port: 3306,
    connectTimeout: 10000, // 10 seconds
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
