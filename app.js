const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('dotenv').config();

const app = express();

// ========== CONFIGURACIÓN ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== MIDDLEWARES (EN ESTE ORDEN) ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.messages = req.flash();
    next();
});

// ========== RUTAS ==========
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const viewsRoutes = require('./routes/views');
const productsRoutes = require('./routes/products');

app.use('/', authRoutes);
app.use('/', usersRoutes);
app.use('/', viewsRoutes);
app.use('/', productsRoutes);

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});