const { Pool } = require('pg');
require('dotenv').config();

console.log('📡 Conectando a Supabase...');
console.log('Host:', process.env.DB_HOST);

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Probar conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a Supabase:', err.stack);
    } else {
        console.log('✅ Conectado a Supabase PostgreSQL');
        release();
    }
});

module.exports = pool;