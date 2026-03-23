const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Mostrar formulario de login
router.get('/login', (req, res) => {
    const messages = req.flash ? req.flash() : {};
    res.render('form_login', { messages });
});

// Procesar login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔵 POST /login recibido');
    
    try {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            if (req.flash) req.flash('error', 'El correo no existe');
            return res.redirect('/login');
        }
        
        const usuario = result.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        
        if (!validPassword) {
            if (req.flash) req.flash('error', 'Contraseña incorrecta ❌');
            return res.redirect('/login');
        }
        
        // Guardar sesión
        req.session.usuario_id = usuario.id;
        req.session.usuario_nombre = usuario.nombre;
        req.session.usuario_rol = usuario.rol;
        
        console.log('✅ Login exitoso:', usuario.email);
        
        // Guardar sesión explícitamente
        req.session.save((err) => {
            if (err) {
                console.error('❌ Error guardando sesión:', err);
                if (req.flash) req.flash('error', 'Error al iniciar sesión');
                return res.redirect('/login');
            }
            
            if (req.flash) req.flash('success', `Bienvenido ${usuario.nombre}!`);
            res.redirect('/');
        });
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        if (req.flash) req.flash('error', 'Error en el servidor');
        res.redirect('/login');
    }
});

// Mostrar formulario de registro
router.get('/register', (req, res) => {
    const messages = req.flash ? req.flash() : {};
    res.render('form_register', { messages });
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
        
        if (req.flash) req.flash('success', 'Registro exitoso, Ahora puedes iniciar sesión ✔');
        res.redirect('/login');
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        if (req.flash) req.flash('error', 'Error al registrar usuario');
        res.redirect('/register');
    }
});

// Cerrar sesión
router.get('/logout', (req, res) => {
    console.log('🔵 GET /logout recibido');
    
    if (!req.session) {
        return res.redirect('/login');
    }
    
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Error al cerrar sesión:', err);
        }
        console.log('✅ Sesión cerrada correctamente');
        res.redirect('/login');
    });
});

module.exports = router;