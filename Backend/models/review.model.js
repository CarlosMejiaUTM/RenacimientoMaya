const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    comment: { type: String, required: [true, 'El comentario no puede estar vacío.'] },
    rating: { type: Number, min: 1, max: 5, required: [true, 'Por favor, proporciona una calificación.'] },
    zone: { type: mongoose.Schema.ObjectId, ref: 'Zone', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

reviewSchema.index({ zone: 1, user: 1 }, { unique: true });

reviewSchema.statics.calculateAverageRating = async function(zoneId) {
    const stats = await this.aggregate([
        { $match: { zone: zoneId } },
        { $group: { _id: '$zone', numReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
    ]);
    try {
        await mongoose.model('Zone').findByIdAndUpdate(zoneId, stats.length > 0 ? 
            { numReviews: stats[0].numReviews, averageRating: stats[0].avgRating } : 
            { numReviews: 0, averageRating: 0 }
        );
    } catch (err) { console.error('Error al calcular el rating promedio:', err); }
};

// Se ejecuta al crear (.save()) y al eliminar (.remove())
reviewSchema.post('save', function() { this.constructor.calculateAverageRating(this.zone); });
reviewSchema.post('remove', function() { this.constructor.calculateAverageRating(this.zone); });

// Se ejecuta al actualizar (findByIdAndUpdate)
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.clone().findOne();
    next();
});
reviewSchema.post(/^findOneAnd/, async function() {
    if (this.r) await this.r.constructor.calculateAverageRating(this.r.zone);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;