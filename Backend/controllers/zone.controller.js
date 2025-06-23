const Zone = require('../models/zone.model');
const Review = require('../models/review.model');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Obtiene todas las zonas con filtros, paginación y búsqueda.
 */
exports.getAllZones = async (req, res) => {
    try {
        let filter = {};
        if (req.query.municipality) {
            filter.municipality = req.query.municipality;
        }
        if (req.query.search) {
            filter.name = { $regex: req.query.search, $options: 'i' };
        }
        
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total = await Zone.countDocuments(filter);
        const zones = await Zone.find(filter)
            .populate('reviews')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });
        
        res.status(200).json({ 
            status: 'success', 
            results: zones.length, 
            page, 
            pages: Math.ceil(total / limit), 
            total, 
            data: zones 
        });
    } catch (error) { 
        res.status(500).json({ message: 'Error al obtener las zonas', error: error.message });
    }
};

/**
 * Obtiene una zona específica por su ID.
 */
exports.getZoneById = async (req, res) => {
    try {
        const zone = await Zone.findById(req.params.id).populate({
            path: 'reviews',
            populate: { path: 'user', select: 'username' }
        });

        if (!zone) {
            return res.status(404).json({ message: 'Zona no encontrada' });
        }
        
        res.status(200).json({ status: 'success', data: zone });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la zona', error: error.message });
    }
};

/**
 * Crea una nueva zona, manejando la subida de múltiples imágenes.
 */
exports.createZone = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Por favor, sube al menos una imagen.' });
        }

        const uploadPromises = req.files.map(file => {
            const form = new FormData();
            form.append('image', file.buffer.toString('base64'));
            return axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, {
                headers: form.getHeaders()
            });
        });
        const uploadResults = await Promise.all(uploadPromises);

        const imageUrls = uploadResults.map(response => {
            if (!response.data.success) {
                throw new Error('Una de las imágenes no se pudo subir.');
            }
            return response.data.data.url;
        });

        const { name, municipality, description } = req.body;
        const newZone = await Zone.create({ 
            name, 
            municipality, 
            description, 
            imageUrls 
        });

        res.status(201).json({ status: 'success', data: newZone });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la zona', error: error.message });
    }
};

/**
 * Actualiza una zona existente, permitiendo añadir o eliminar imágenes.
 */
exports.updateZone = async (req, res) => {
    try {
        const zone = await Zone.findById(req.params.id);
        if (!zone) {
            return res.status(404).json({ message: 'Zona no encontrada' });
        }

        // Actualiza los campos de texto.
        zone.name = req.body.name || zone.name;
        zone.municipality = req.body.municipality || zone.municipality;
        zone.description = req.body.description || zone.description;

        // Si se suben nuevos archivos, los procesa y los añade a la galería.
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => {
                const form = new FormData();
                form.append('image', file.buffer.toString('base64'));
                return axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, form, { headers: form.getHeaders() });
            });
            const uploadResults = await Promise.all(uploadPromises);
            
            // --- CORRECCIÓN AQUÍ: Añadimos la validación de éxito ---
            const newImageUrls = uploadResults.map(response => {
                // Si una de las imágenes falla al subir, lanzamos un error para detener todo.
                if (!response.data.success) {
                    throw new Error('Error al subir una de las nuevas imágenes a ImgBB.');
                }
                return response.data.data.url;
            });
            // --- FIN DE LA CORRECCIÓN ---
            
            zone.imageUrls.push(...newImageUrls);
        }

        // Si el frontend envía una lista de imágenes a eliminar, las quita del array.
        if (req.body.deletedImages && Array.isArray(req.body.deletedImages)) {
            zone.imageUrls = zone.imageUrls.filter(url => !req.body.deletedImages.includes(url));
        }

        // Guarda todos los cambios en la base de datos.
        await zone.save();
        
        res.status(200).json({ status: 'success', data: zone });

    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la zona', error: error.message });
    }
};
 
/**
 * Elimina una zona y todas sus reseñas asociadas.
 */
exports.deleteZone = async (req, res) => {
    try {
        const zoneId = req.params.id;
        const zone = await Zone.findById(zoneId);
        if (!zone) {
            return res.status(404).json({ message: 'Zona no encontrada' });
        }
 
        await Review.deleteMany({ zone: zoneId });
        await Zone.findByIdAndDelete(zoneId); 
        
        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la zona', error: error.message });
    }
};
exports.getUniqueMunicipalities = async (req, res) => {
    try {
        // Usa el método .distinct() para obtener todos los valores únicos del campo 'municipality'.
        const municipios = await Zone.distinct('municipality');
        
        // Ordena la lista alfabéticamente.
        municipios.sort();

        res.status(200).json({
            status: 'success',
            data: municipios
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los municipios', error: error.message });
    }
};
