const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Admin = require('../models/admin.model');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role === 'admin') {
                req.user = await Admin.findById(decoded.id).select('-password');
            } else {
                req.user = await User.findById(decoded.id).select('-password');
            }
            if (!req.user) return res.status(401).json({ message: 'Usuario no encontrado' });
            next();
        } catch (error) {
            return res.status(401).json({ message: 'No autorizado, el token falló' });
        }
    }
    if (!token) return res.status(401).json({ message: 'No autorizado, no se proporcionó un token' });
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Acceso denegado: Se requiere rol de administrador' });
    }
};