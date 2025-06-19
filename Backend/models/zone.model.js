const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    municipality: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5, set: val => Math.round(val * 10) / 10 },
    numReviews: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

zoneSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'zone',
    localField: '_id'
});

zoneSchema.pre('remove', async function(next) {
    await this.model('Review').deleteMany({ zone: this._id });
    next();
});

const Zone = mongoose.model('Zone', zoneSchema);
module.exports = Zone;