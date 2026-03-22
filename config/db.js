const { Pool } = require('pg');
require('dotenv').config();

// Configuración optimizada para Supabase Session Pooler
const pool = new Pool({
    host: process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    user: process.env.DB_USER || 'postgres.ifqjrycxdljbaidcgnjg',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    port: parseInt(process.env.DB_PORT || '6542'),
    ssl: { 
        rejectUnauthorized: false 
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10
});

// Probar conexión
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Conectado a Supabase PostgreSQL');
        console.log(`📍 Host: ${process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com'}`);
        console.log(`📍 Puerto: ${process.env.DB_PORT || '6542'}`);
        client.release();
    } catch (err) {
        console.error('❌ Error conectando a Supabase:');
        console.error(`📌 ${err.message}`);
        console.error(`📌 Host: ${process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com'}`);
        console.error(`📌 Puerto: ${process.env.DB_PORT || '6542'}`);
    }
};

testConnection();

module.exports = pool;