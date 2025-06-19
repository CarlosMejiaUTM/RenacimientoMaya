const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

adminSchema.virtual('role').get(function() { return 'admin'; });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;