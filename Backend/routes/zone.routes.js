const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const { protect, isAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const reviewRouter = require('./review.routes');
router.get('/municipalities', zoneController.getUniqueMunicipalities);

router.use('/:zoneId/reviews', reviewRouter);

router.route('/')
    .get(zoneController.getAllZones)
    .post(protect, isAdmin, upload.array('images', 10), zoneController.createZone);

router.route('/:id')
    .get(zoneController.getZoneById)
    .put(protect, isAdmin, upload.array('images', 10), zoneController.updateZone)
    .delete(protect, isAdmin, zoneController.deleteZone);

module.exports = router;