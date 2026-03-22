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
    console.log('🔵 POST /login recibido');
    console.log('Body:', req.body);
    
    const { email, password } = req.body;
    
    try {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        
        console.log('Usuario encontrado:', result.rows.length > 0);
        
        if (result.rows.length === 0) {
            req.flash('error', 'El correo no existe');
            return res.redirect('/login');
        }
        
        const usuario = result.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        
        console.log('Contraseña válida:', validPassword);
        
        if (!validPassword) {
            req.flash('error', 'Contraseña incorrecta ❌');
            return res.redirect('/login');
        }
        
        req.session.usuario_id = usuario.id;
        req.session.usuario_nombre = usuario.nombre;
        req.session.usuario_rol = usuario.rol;
        
        console.log('✅ Login exitoso, redirigiendo a /');
        req.flash('success', `Bienvenido ${usuario.nombre}!`);
        res.redirect('/');
        
    } catch (error) {
        console.error('❌ Error en login:', error);
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
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
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