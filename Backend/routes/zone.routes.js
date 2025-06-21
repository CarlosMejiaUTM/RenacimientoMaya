const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const { protect, isAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const reviewRouter = require('./review.routes');


// POST /api/zones/ID_DE_ZONA/reviews
router.use('/:zoneId/reviews', reviewRouter);

router.route('/')
    .get(zoneController.getAllZones)
    .post(protect, isAdmin, upload.single('image'), zoneController.createZone);

router.route('/:id')
    .get(zoneController.getZoneById)
    .put(protect, isAdmin, upload.single('image'), zoneController.updateZone)
    .delete(protect, isAdmin, zoneController.deleteZone);


module.exports = router;