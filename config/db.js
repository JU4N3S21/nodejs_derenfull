const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está definida');
    process.exit(1);
}

console.log('🔌 Conectando a Supabase...');

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    // Forzar IPv4
    family: 4
});

pool.connect((err) => {
    if (err) {
        console.error('❌ Error:', err.message);
    } else {
        console.log('✅ Conectado a Supabase PostgreSQL');
    }
});

module.exports = pool;