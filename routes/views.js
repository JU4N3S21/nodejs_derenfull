const express = require('express');
const router = express.Router();

// Página principal
router.get('/', (req, res) => {
    res.render('index', { session: req.session });
});

// Página del carrito
router.get('/carrito', (req, res) => {
    res.render('carrito', { session: req.session });
});

module.exports = router;