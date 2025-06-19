const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Obtener la lista de favoritos
router.get('/:userId/favorites', protect, userController.getUserFavorites);

// Añadir un favorito (se pasa el ID de la zona en el body)
router.post('/:userId/favorites', protect, userController.addUserFavorite);

// Eliminar un favorito (se pasa el ID de la zona en la URL)
router.delete('/:userId/favorites/:zoneId', protect, userController.removeUserFavorite);

module.exports = router;