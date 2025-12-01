const express = require('express');
const router = express.Router();
const {createCommunity, getAllCommunities, deleteCommunity, replaceHoaAdmin, getGlobalPayments, sendNotification, getNotification, getSuperAdminDashboard } = require('../controllers/superAdmin/superAdminController');
const { createAmenity, getAllAmenities } = require('../controllers/superAdmin/amenityController');
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.get('/getcommunities', getAllCommunities);
router.use(protect); // all routes below need authentication

router.get('/dashboard', authorizeRoles("superadmin"), getSuperAdminDashboard);

router.post("/addAmenities", authorizeRoles("superadmin"), createAmenity);
router.get("/getallamenities", authorizeRoles("superadmin"), getAllAmenities);

router.post("/addCommunity", authorizeRoles("superadmin"), createCommunity);

router.delete('/deletecommunity/:communityId', authorizeRoles("superadmin"), deleteCommunity);
router.put('/updatecommunities/:communityId/replace-admin', authorizeRoles("superadmin"), replaceHoaAdmin);

// Global Payments Report
router.get('/payments/global', authorizeRoles("superadmin"), getGlobalPayments);

// System-wide Notifications
router.post('/addnotifications', authorizeRoles("superadmin"), sendNotification);
router.get('/getnotifications', authorizeRoles("superadmin"), getNotification);

module.exports = router;