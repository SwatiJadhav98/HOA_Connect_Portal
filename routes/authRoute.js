const express = require('express');
const router = express.Router();
const {protect, forgotPassword } = require('../middleware/authMiddleware');
const { register, login, getAllAdmins, registerAdmin, resetPassword, changePassword } = require('../controllers/authController');

router.post('/login', login);
// protected: only authenticated user (SuperAdmin or Admin) may call register
router.post('/register', protect, register);
router.get('/getadmins', protect , getAllAdmins);
router.post('/register-admin', protect, registerAdmin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/change-password", protect, changePassword);

module.exports = router;