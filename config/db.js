const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está definida en las variables de entorno');
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
        // Muestra la URL ocultando la contraseña para depuración
        const hiddenUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
        console.error('📌 URL usada:', hiddenUrl);
    } else {
        console.log('✅ Conectado a Supabase PostgreSQL (Transaction Pooler)');
        release();
    }
});

module.exports = pool;