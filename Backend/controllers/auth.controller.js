const User = require('../models/user.model');
const Admin = require('../models/admin.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await User.create({ username, email, password });
        try {
            await sendEmail({ email: newUser.email, subject: '¡Gracias por registrarte!', html: `<h1>¡Hola, ${newUser.username}!</h1><p>Te damos la bienvenida.</p>`});
        } catch (emailError) { console.error('Correo no enviado:', emailError); }
        const token = generateToken(newUser._id, 'user');
        res.status(201).json({ message: 'Usuario registrado.', token, user: { id: newUser._id, username: newUser.username, email: newUser.email, role: 'user' } });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: `El ${Object.keys(error.keyValue)[0]} ya está en uso.` });
        res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
};
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        let entity = await User.findOne({ username }).select('+password');
        let role = 'user';
        if (!entity) {
            entity = await Admin.findOne({ username }).select('+password');
            role = 'admin';
        }
        if (!entity || !(await bcrypt.compare(password, entity.password))) return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        const token = generateToken(entity._id, role);
        res.status(200).json({ message: `Login exitoso como ${role}`, token, user: { id: entity._id, username: entity.username, role: role } });
    } catch (error) { res.status(500).json({ message: 'Error en el servidor', error: error.message }); }
};
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'No existe un usuario con ese correo.' });
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const message = `Has solicitado un reseteo de contraseña. Haz clic en el siguiente enlace (válido por 10 minutos): <a href="${resetURL}">${resetURL}</a>`;
        try {
            await sendEmail({ email: user.email, subject: 'Reseteo de contraseña', html: message });
            res.status(200).json({ status: 'success', message: 'Token enviado al correo.' });
        } catch (err) {
            user.resetPasswordToken = undefined; user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Error enviando el email.' });
        }
    } catch (error) { res.status(500).json({ message: 'Error en el servidor', error: error.message }); }
};
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = require('crypto').createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: 'Token inválido o expirado.' });
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        const token = generateToken(user._id, 'user');
        res.status(200).json({ status: 'success', token, message: "Contraseña actualizada." });
    } catch (error) { res.status(500).json({ message: 'Error en el servidor', error: error.message }); }
};