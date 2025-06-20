const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/admin.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
    if (!MONGO_URI) {
        console.error('Error: La variable MONGO_URI no está definida en el archivo .env');
        return;
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.log('Conectado a la BD para creación de admin...');

        // -- CONFIGURA TU ADMIN AQUÍ --
        const username = 'admin1';
        const password = 'admin';
        // -------------------------

        const adminExists = await Admin.findOne({ username });
        if (adminExists) {
            console.log(`El usuario admin "${username}" ya existe.`);
            mongoose.connection.close();
            return;
        }
        
        await Admin.create({ username, password });

        console.log(`¡Usuario admin "${username}" creado exitosamente!`);
    } catch (error) {
        console.error('Error al crear el admin:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Conexión a la BD cerrada.');
    }
};

createAdmin();