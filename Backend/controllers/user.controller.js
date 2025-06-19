const User = require('../models/user.model');

// POST /api/users/:userId/favorites
exports.addUserFavorite = async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) return res.status(403).json({ message: 'Acceso denegado.' });
        const { zonaId } = req.body;
        await User.findByIdAndUpdate(req.params.userId, { $addToSet: { favorites: zonaId } });
        res.status(200).json({ message: 'Favorito agregado exitosamente.' });
    } catch (error) { res.status(500).json({ message: 'Error al agregar favorito', error: error.message }); }
};

// DELETE /api/users/:userId/favorites/:zoneId
exports.removeUserFavorite = async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) return res.status(403).json({ message: 'Acceso denegado.' });
        const { zoneId } = req.params;
        await User.findByIdAndUpdate(req.params.userId, { $pull: { favorites: zoneId } });
        res.status(200).json({ message: 'Favorito eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar favorito', error: error.message });
    }
};

// GET /api/users/:userId/favorites
exports.getUserFavorites = async (req, res) => {
    try {
        if (req.user.id !== req.params.userId) return res.status(403).json({ message: 'Acceso denegado.' });
        const user = await User.findById(req.params.userId).populate('favorites');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ status: 'success', data: user.favorites });
    } catch (error) { res.status(500).json({ message: 'Error al obtener favoritos', error: error.message }); }
};