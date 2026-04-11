const sql = require('mssql');

console.log('🔵 Loading db.js...');

// Read from environment variables (recommended)
const config = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',  // Use env variable
    database: process.env.DB_NAME || 'Maidan',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '12345678',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,  // Set to true for Azure/production
        trustServerCertificate: true,  // Important for local development
        enableArithAbort: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
};

console.log('📡 Database config:', {
    server: config.server,
    database: config.database,
    user: config.user,
    port: config.port
});

let pool = null;

export async function getConnection() {
    console.log('🔄 getConnection called, pool exists:', !!pool);
    
    if (!pool) {
        console.log('🆕 Creating new connection pool...');
        try {
            pool = await sql.connect(config);
            console.log('✅✅✅ DB CONNECTED SUCCESSFULLY! ✅✅✅');
            
            // Test the connection
            const result = await pool.request().query('SELECT GETDATE() as currentTime');
            console.log('🕐 Database time:', result.recordset[0]);
            
        } catch (error) {
            console.error('❌ DB Connection Failed:', error.message);
            console.error('Full error:', error);
            throw error;
        }
    }
    return pool;
}

export { sql };