const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión CON VERIFICACIÓN
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_clave_secreta_para_derenfull_2026',
    resave: true,  // Cambiado a true para forzar guardado
    saveUninitialized: true,  // Cambiado a true para forzar inicialización
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Middleware para verificar que la sesión funciona
app.use((req, res, next) => {
    if (!req.session) {
        console.error('❌ Sesión no inicializada');
        return next(new Error('Session failed'));
    }
    console.log('✅ Sesión activa, ID:', req.sessionID);
    next();
});

// Flash después de sesión
app.use(flash());

// Middleware para variables locales
app.use((req, res, next) => {
    res.locals.session = req.session || {};
    res.locals.messages = req.flash ? req.flash() : {};
    res.locals.isAuthenticated = !!req.session?.usuario_id;
    next();
});

// Rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const viewsRoutes = require('./routes/views');
const productsRoutes = require('./routes/products');

app.use('/', authRoutes);
app.use('/', usersRoutes);
app.use('/', viewsRoutes);
app.use('/', productsRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error global:', err);
    res.status(500).send('Error interno del servidor');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});