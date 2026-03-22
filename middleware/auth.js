// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session.usuario_id) {
        return next();
    }
    req.flash('error', 'Debes iniciar sesión ❌');
    res.redirect('/login');
};

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
    if (req.session.usuario_id && req.session.usuario_rol === 'admin') {
        return next();
    }
    req.flash('error', 'No tienes permisos para acceder a esta sección ❌');
    res.redirect('/');
};

module.exports = { isAuthenticated, isAdmin };