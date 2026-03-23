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

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ⚠️ IMPORTANTE: Configuración de sesión ANTES de flash
app.use(session({
    secret: process.env.SESSION_SECRET || 'mi_clave_secreta_para_derenfull_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,  // En Render con HTTPS debería ser true, pero déjalo false por ahora
        maxAge: 1000 * 60 * 60 * 24  // 24 horas
    }
}));

// Flash messages - DESPUÉS de session
app.use(flash());

// Middleware para pasar variables globales a las vistas
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.messages = req.flash();
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});