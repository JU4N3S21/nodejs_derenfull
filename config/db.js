const { Pool } = require('pg');
require('dotenv').config();

// Usar DATABASE_URL directamente
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está definida');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a Supabase:', err.message);
        // Oculta la contraseña en los logs
        const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
        console.error('📌 URL usada:', safeUrl);
    } else {
        console.log('✅ Conectado a Supabase PostgreSQL');
        release();
    }
});

module.exports = pool;