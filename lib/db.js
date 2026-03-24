const sql = require('mssql');

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool;

export async function getConnection() {
    if (!pool) {
        pool = await sql.connect(config);
        console.log('✅ DB Connected');
    }
    return pool;
}

export { sql };