require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Importar los enrutadores
const authRoutes = require('./routes/auth.routes');
const zoneRoutes = require('./routes/zone.routes');
const userRoutes = require('./routes/user.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

// RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.send('API v3.0 (RESTful Completa) para Zonas Turísticas de Yucatán está funcionando...');
});

app.listen(PORT, () => {
    console.log(`Servidor v3.0 corriendo en el puerto ${PORT}`);
});