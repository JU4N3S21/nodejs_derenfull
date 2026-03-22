const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { isAdmin } = require('../middleware/auth');

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../public/img/productos');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

// ==================== RUTAS DE PRODUCTOS ====================

// Listar productos (solo admin)
router.get('/productos', isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p 
            LEFT JOIN categorias c ON p.categoria_id = c.id 
            ORDER BY p.id DESC
        `);
        const productos = result.rows;
        res.render('productos/listar', { productos, messages: req.flash() });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar productos');
        res.redirect('/');
    }
});

// Formulario para crear producto (solo admin)
router.get('/productos/crear', isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nombre');
        const categorias = result.rows;
        res.render('productos/crear', { categorias, messages: req.flash() });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar categorías');
        res.redirect('/productos');
    }
});

// Guardar nuevo producto (solo admin)
router.post('/productos/guardar', isAdmin, upload.single('imagen'), async (req, res) => {
    const { nombre, descripcion, precio, stock, categoria_id } = req.body;
    let imagen = null;
    
    // Validaciones básicas
    if (!nombre || !descripcion || !precio || precio <= 0 || !categoria_id) {
        req.flash('error', 'Todos los campos son obligatorios');
        return res.redirect('/productos/crear');
    }
    
    // Si se subió una imagen
    if (req.file) {
        imagen = '/img/productos/' + req.file.filename;
    }
    
    try {
        await pool.query(
            `INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, imagen) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [nombre, descripcion, precio, stock || 0, categoria_id, imagen]
        );
        
        req.flash('success', 'Producto agregado correctamente');
        res.redirect('/productos');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al agregar producto');
        res.redirect('/productos/crear');
    }
});

// Formulario para editar producto (solo admin)
router.get('/productos/editar/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT * FROM productos WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            req.flash('error', 'Producto no encontrado');
            return res.redirect('/productos');
        }
        
        const categoriasResult = await pool.query('SELECT * FROM categorias ORDER BY nombre');
        const categorias = categoriasResult.rows;
        
        res.render('productos/editar', { 
            producto: result.rows[0], 
            categorias, 
            messages: req.flash() 
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar producto');
        res.redirect('/productos');
    }
});

// Actualizar producto (solo admin)
router.post('/productos/actualizar/:id', isAdmin, upload.single('imagen'), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria_id, imagen_actual } = req.body;
    let imagen = imagen_actual;
    
    try {
        // Si se subió una nueva imagen
        if (req.file) {
            imagen = '/img/productos/' + req.file.filename;
        }
        
        await pool.query(
            `UPDATE productos 
             SET nombre = $1, descripcion = $2, precio = $3, stock = $4, categoria_id = $5, imagen = $6 
             WHERE id = $7`,
            [nombre, descripcion, precio, stock || 0, categoria_id, imagen, id]
        );
        
        req.flash('success', 'Producto actualizado correctamente');
        res.redirect('/productos');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al actualizar producto');
        res.redirect(`/productos/editar/${id}`);
    }
});

// Eliminar producto (solo admin)
router.get('/productos/eliminar/:id', isAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        req.flash('success', 'Producto eliminado correctamente');
        res.redirect('/productos');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al eliminar producto');
        res.redirect('/productos');
    }
});

// Obtener producto por ID (API para carrito)
router.get('/api/productos/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT id, nombre, precio, imagen FROM productos WHERE id = $1',
            [id]
        );
        
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;