const express = require('express');
const reviewController = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');

// { mergeParams: true } es clave para que las rutas anidadas funcionen
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(reviewController.getReviewsForZone)
    .post(protect, reviewController.createReview);

router.route('/:id')
    .put(protect, reviewController.updateReview)
    .delete(protect, reviewController.deleteReview);

module.exports = router;