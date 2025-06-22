const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    municipality: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    
    // CAMBIO: De 'imageUrl' a 'imageUrls' para guardar una lista.
    imageUrls: { 
        type: [String], 
        required: true,
        validate: [val => val.length > 0, 'Se requiere al menos una imagen.']
    },
    
    averageRating: { type: Number, default: 0, min: 0, max: 5, set: val => Math.round(val * 10) / 10 },
    numReviews: { type: Number, default: 0 }
}, { 
    timestamps: true, 
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

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