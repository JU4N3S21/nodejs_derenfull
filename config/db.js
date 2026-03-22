const { Pool } = require('pg');
require('dotenv').config();

// Configuración optimizada para Transaction Pooler
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '6543'),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 5,  // Menos conexiones para evitar sobrecarga
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
};

const pool = new Pool(config);

// Prueba con timeout más largo
const testConnection = async () => {
    let client;
    try {
        console.log('🔌 Intentando conectar a Supabase...');
        console.log(`📡 Host: ${config.host}:${config.port}`);
        console.log(`👤 User: ${config.user}`);
        
        client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Conectado a Supabase PostgreSQL');
        console.log(`🕒 Hora del servidor: ${result.rows[0].now}`);
        client.release();
    } catch (err) {
        console.error('❌ Error conectando a Supabase:');
        console.error(`📌 ${err.message}`);
        console.error(`📌 Host: ${config.host}`);
        console.error(`📌 Puerto: ${config.port}`);
        if (err.code) console.error(`📌 Código: ${err.code}`);
    }
};

// Esperar un poco antes de probar (por si la red tarda en estabilizarse)
setTimeout(() => testConnection(), 3000);

module.exports = pool;