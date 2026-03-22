const { Pool } = require('pg');

// Usar SOLO la variable de entorno DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está definida en las variables de entorno');
    process.exit(1);
}

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
});

pool.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a Supabase:', err.message);
    } else {
        console.log('✅ Conectado a Supabase PostgreSQL');
    }
});

module.exports = pool;