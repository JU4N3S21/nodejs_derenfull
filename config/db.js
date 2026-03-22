const { Pool } = require('pg');
require('dotenv').config();

// Configurar para usar IPv4 en lugar de IPv6
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Forzar IPv4
    family: 4
});

// Probar conexión
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a Supabase:', err.message);
    } else {
        console.log('✅ Conectado a Supabase PostgreSQL');
        release();
    }
});

module.exports = pool;