const Zone = require('../models/zone.model');
const axios = require('axios');
const FormData = require('form-data');
const Review = require('../models/review.model'); 


// GET /api/zones (con búsqueda, filtro y paginación)
exports.getAllZones = async (req, res) => {
    try {
        let filter = {};
        if (req.query.municipality) filter.municipality = req.query.municipality;
        if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const total = await Zone.countDocuments(filter);
        const zones = await Zone.find(filter).populate('reviews').limit(limit).skip(skip).sort({ createdAt: -1 });
        res.status(200).json({ status: 'success', results: zones.length, page, pages: Math.ceil(total / limit), total, data: zones });
    } catch (error) { res.status(500).json({ message: 'Error al obtener las zonas', error: error.message }); }
};

// GET /api/zones/:id
exports.getZoneById = async (req, res) => {
    try {
        const zone = await Zone.findById(req.params.id).populate({
            path: 'reviews',
            populate: { path: 'user', select: 'username' }
        });
        if (!zone) return res.status(404).json({ message: 'Zona no encontrada' });
        res.status(200).json({ status: 'success', data: zone });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la zona', error: error.message });
    }
};

// POST /api/zones
exports.createZone = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'Por favor, sube una imagen.' });
        const form = new FormData();
        form.append('image', req.file.buffer.toString('base64'));
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, { headers: form.getHeaders() });
        if (!response.data.success) throw new Error('Error al subir la imagen a imgbb.');
        const { name, municipality, description } = req.body;
        const newZone = await Zone.create({ name, municipality, description, imageUrl: response.data.data.url });
        res.status(201).json({ status: 'success', data: newZone });
    } catch (error) { res.status(500).json({ message: 'Error al crear la zona', error: error.message }); }
};


// PUT /api/zones/:id
exports.updateZone = async (req, res) => {
    try {
      let updateData = {
        name: req.body.name,
        municipality: req.body.municipality,
        description: req.body.description
      };
        if (req.file) {
        // Prepara form-data para imgbb
        const form = new FormData();
        const base64Image = req.file.buffer.toString('base64');
        form.append('image', base64Image);
  
        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
          headers: form.getHeaders()
        });
        if (!response.data.success) {
          return res.status(500).json({ message: 'Error al subir la imagen a imgbb.' });
        }
        // Actualizar URL de la imagen
        updateData.imageUrl = response.data.data.url;
      }
      const zone = await Zone.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
      });
      if (!zone) return res.status(404).json({ message: 'Zona no encontrada' });
      res.status(200).json({ status: 'success', data: zone });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la zona', error: error.message });
    }
  };
  

// DELETE /api/zones/:id
exports.deleteZone = async (req, res) => {
    try {
      const zoneId = req.params.id;
      const zone = await Zone.findById(zoneId);
      if (!zone) return res.status(404).json({ message: 'Zona no encontrada' });
  
      // Eliminar reseñas asociadas
      await Review.deleteMany({ zone: zoneId });
      await Zone.findByIdAndDelete(zoneId); 
      res.status(204).json({ status: 'success', data: null });
    } catch (error) {
      console.error('Error al eliminar la zona:', error);
      res.status(500).json({ message: 'Error al eliminar la zona', error: error.message });
    }
  };