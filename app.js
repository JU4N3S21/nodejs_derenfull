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

// Configuración de sesión
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambiar a true en producción con HTTPS
}));

// Flash messages
app.use(flash());

// Middleware para pasar variables globales a las vistas
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.messages = req.flash();
    next();
});

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const viewsRoutes = require('./routes/views');
const productsRoutes = require('./routes/products');

// Usar rutas
app.use('/', authRoutes);
app.use('/', usersRoutes);
app.use('/', viewsRoutes);
app.use('/', productsRoutes);  // <-- NUEVA LÍNEA


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});