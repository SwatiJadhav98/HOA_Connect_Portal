const express = require('express');
const router = express.Router();
const {protect, forgotPassword } = require('../middleware/authMiddleware');
const { register, login, getAllAdmins, registerAdmin } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', protect, register);
router.get('/getadmins', protect , getAllAdmins);
router.post('/register-admin', protect, registerAdmin);

router.post("/forgot-password", forgotPassword);

module.exports = router;