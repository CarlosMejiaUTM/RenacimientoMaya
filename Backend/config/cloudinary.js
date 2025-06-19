const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configuración de Cloudinary (sin cambios)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar Multer para que guarde el archivo en la memoria como un "buffer"
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Exportamos cloudinary y el middleware de upload por separado
module.exports = { cloudinary, upload };