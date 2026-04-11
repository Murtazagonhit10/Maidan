const sql = require('mssql');

const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'Maidan',
    user: 'sa',
    password: '12345678',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function testConnection() {
    try {
        console.log('🔌 Testing SQL Server connection...');
        console.log('Config:', {
            server: config.server,
            database: config.database,
            user: config.user,
            port: config.port
        });
        
        const pool = await sql.connect(config);
        console.log('✅ Connected successfully!');
        
        const result = await pool.request().query('SELECT GETDATE() as currentTime, @@VERSION as version');
        console.log('📅 Server time:', result.recordset[0].currentTime);
        console.log('💿 SQL Version:', result.recordset[0].version.substring(0, 50) + '...');
        
        await pool.close();
        console.log('✅ Connection closed');
        
    } catch (err) {
        console.error('❌ Connection failed!');
        console.error('Error:', err.message);
        
        if (err.code === 'ELOGIN') {
            console.log('\n💡 Troubleshooting:');
            console.log('1. Check if SQL Server is running');
            console.log('2. Verify username/password: sa / 12345678');
            console.log('3. Enable SQL Server Authentication in SQL Server');
            console.log('4. Check if TCP/IP is enabled in SQL Server Configuration Manager');
        }
    }
}

testConnection();