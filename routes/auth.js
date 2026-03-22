const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Mostrar formulario de login
router.get('/login', (req, res) => {
    res.render('form_login', { messages: req.flash() });
});

// Procesar login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [rows] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (rows.length === 0) {
            req.flash('error', 'El correo no existe');
            return res.redirect('/login');
        }
        
        const usuario = rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        
        if (!validPassword) {
            req.flash('error', 'Contraseña incorrecta ❌');
            return res.redirect('/login');
        }
        
        // Guardar sesión
        req.session.usuario_id = usuario.id;
        req.session.usuario_nombre = usuario.nombre;
        req.session.usuario_rol = usuario.rol;
        
        req.flash('success', `Bienvenido ${usuario.nombre}!`);
        res.redirect('/');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error en el servidor');
        res.redirect('/login');
    }
});

// Mostrar formulario de registro
router.get('/register', (req, res) => {
    res.render('form_register', { messages: req.flash() });
});

// Procesar registro
router.post('/register/guardar', async (req, res) => {
    const { nombre, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hashedPassword, 'cliente']
        );
        
        req.flash('success', 'Registro exitoso, Ahora puedes iniciar sesión ✔');
        res.redirect('/login');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al registrar usuario');
        res.redirect('/register');
    }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
    req.session.destroy();
    req.flash('success', 'Sesión cerrada correctamente');
    res.redirect('/login');
});

module.exports = router;