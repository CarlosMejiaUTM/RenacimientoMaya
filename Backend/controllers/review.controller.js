const Review = require('../models/review.model');

// POST /api/zones/:zoneId/reviews
exports.createReview = async (req, res) => {
    try {
        req.body.zone = req.params.zoneId;
        req.body.user = req.user.id;
        const newReview = await Review.create(req.body);
        res.status(201).json({ status: 'success', data: newReview });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Ya has publicado una reseña para esta zona.' });
        res.status(500).json({ message: 'Error al crear la reseña', error: error.message });
    }
};

// GET /api/zones/:zoneId/reviews
exports.getReviewsForZone = async (req, res) => {
    try {
        const reviews = await Review.find({ zone: req.params.zoneId }).populate('user', 'username');
        res.status(200).json({ status: 'success', results: reviews.length, data: reviews });
    } catch (error) { res.status(500).json({ message: 'Error al obtener las reseñas', error: error.message }); }
};

// PUT /api/reviews/:id
exports.updateReview = async (req, res) => {
    try {
        let review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
        if (review.user.toString() !== req.user.id) return res.status(403).json({ message: 'No tienes permiso para editar esta reseña.' });
        
        // Solo permitir actualizar el comentario y la calificación
        review.comment = req.body.comment || review.comment;
        review.rating = req.body.rating || review.rating;
        
        await review.save();
        
        res.status(200).json({ status: 'success', data: review });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la reseña', error: error.message });
    }
};


// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Reseña no encontrada' });
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta reseña.' });
        }
        await review.remove(); // Usamos .remove() para disparar el hook del modelo
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
         res.status(500).json({ message: 'Error al eliminar la reseña', error: error.message });
    }
};