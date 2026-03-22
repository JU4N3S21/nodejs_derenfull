const { Pool } = require('pg');
require('dotenv').config();

// En Render, DATABASE_URL viene de las variables de entorno
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
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error:', err.message);
    } else {
        console.log('✅ Conectado a Supabase PostgreSQL');
        release();
    }
});

module.exports = pool;