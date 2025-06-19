const express = require('express');
const router = express.Router();
const { registerUser, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;