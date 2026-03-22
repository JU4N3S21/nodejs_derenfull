const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { isAdmin } = require('../middleware/auth');

// Listar usuarios (solo admin)
router.get('/usuarios', isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usuarios ORDER BY id');
        const usuarios = result.rows;
        res.render('listar_usuarios', { usuarios, messages: req.flash() });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar usuarios');
        res.redirect('/');
    }
});

// Formulario para agregar usuario (solo admin)
router.get('/usuarios/crear', isAdmin, (req, res) => {
    res.render('crear_usuario', { messages: req.flash() });
});

// Guardar nuevo usuario (solo admin)
router.post('/usuarios/guardar', isAdmin, async (req, res) => {
    const { nombre, email, password, rol = 'cliente' } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4)',
            [nombre, email, hashedPassword, rol]
        );
        
        req.flash('success', 'Usuario agregado correctamente');
        res.redirect('/usuarios');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al agregar usuario');
        res.redirect('/usuarios/crear');
    }
});

// Formulario para editar usuario (solo admin)
router.get('/usuarios/editar/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            req.flash('error', 'Usuario no encontrado');
            return res.redirect('/usuarios');
        }
        
        res.render('editar_usuario', { usuario: result.rows[0], messages: req.flash() });
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar usuario');
        res.redirect('/usuarios');
    }
});

// Actualizar usuario (solo admin)
router.post('/usuarios/actualizar/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, rol, password } = req.body;
    
    try {
        if (!password || password.trim() === '') {
            // Actualizar sin cambiar contraseña
            await pool.query(
                'UPDATE usuarios SET nombre = $1, email = $2, rol = $3 WHERE id = $4',
                [nombre, email, rol, id]
            );
        } else {
            // Actualizar con nueva contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE usuarios SET nombre = $1, email = $2, password = $3, rol = $4 WHERE id = $5',
                [nombre, email, hashedPassword, rol, id]
            );
        }
        
        req.flash('success', 'Usuario actualizado correctamente');
        res.redirect('/usuarios');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al actualizar usuario');
        res.redirect(`/usuarios/editar/${id}`);
    }
});

// Eliminar usuario (solo admin)
router.get('/usuarios/eliminar/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        req.flash('success', 'Usuario eliminado correctamente');
        res.redirect('/usuarios');
        
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al eliminar usuario');
        res.redirect('/usuarios');
    }
});

module.exports = router;