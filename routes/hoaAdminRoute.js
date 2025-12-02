const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Controllers
const { getHoaAdminDashboard } = require('../controllers/hoaAdmin/dashboardController');
const { createAnnouncement, getAnnouncements } = require('../controllers/hoaAdmin/announcementController');
const { createResident, deleteResident, getResidents, updateResident} = require('../controllers/hoaAdmin/residentController');
const {getAmenities, updateAmenity, getAmenityById} = require('../controllers/hoaAdmin/amenityController');
const { getComplaints, updateComplaintStatus} = require('../controllers/hoaAdmin/complaintController');
const { getPayments, updatePaymentStatus, getPaymentsByDate} = require('../controllers/hoaAdmin/paymentController');
const { createPoll, getPolls} = require('../controllers/hoaAdmin/pollController');
const { uploadDocument, deleteDocument, getDocuments } = require('../controllers/hoaAdmin/documentController');
const {getNotification, sendNotification, createNotification} = require('../controllers/hoaAdmin/notificationController');
const { createMeeting, getMeetings } = require('../controllers/hoaAdmin/meetingController');
const { getAnalytics} = require('../controllers/hoaAdmin/analyticsController');
const { replaceAdmin} = require('../controllers/hoaAdmin/replaceAdminController');

//Dashboard
router.get('/dashboard', protect, authorizeRoles("admin"), getHoaAdminDashboard);

//Announcements
router.post('/postannounce',protect, authorizeRoles("admin"), createAnnouncement);
router.get('/getannouncements', protect, authorizeRoles("admin"), getAnnouncements);

// Residents
router.post('/addresident', protect, authorizeRoles("admin"), createResident);
router.get('/getresidents', protect, authorizeRoles("admin"), getResidents);
router.put('/updateresident/:id', protect, authorizeRoles("admin"), updateResident);
router.delete('/deleteresident/:id', protect, authorizeRoles("admin"), deleteResident);

// Amenities
router.get('/getamenities', protect, authorizeRoles("admin"), getAmenities);
router.put('/updateamenity/:id', protect, authorizeRoles("admin"), updateAmenity);
router.get('/getamenitybyid/:id', protect, authorizeRoles("admin"), getAmenityById);

// Complaints
router.get('/getcomplaints', protect, authorizeRoles("admin"), getComplaints);
router.put('/updatecomplaint/:id', protect, authorizeRoles("admin"), updateComplaintStatus);

// Payments
router.get('/getpayments', protect, authorizeRoles("admin"), getPayments);
router.put('/updatepaymentstatus/:id', protect, authorizeRoles("admin"), updatePaymentStatus);
router.get('/search',protect,authorizeRoles("admin") ,getPaymentsByDate)

// Polls
router.post('/addpoll', protect, authorizeRoles("admin"), createPoll);
router.get('/getpolls', protect, authorizeRoles("admin"), getPolls);

// Documents
router.post('/upload', protect, authorizeRoles("admin"), upload.single('file'), uploadDocument);
router.get('/getdocuments', protect, authorizeRoles("admin"), getDocuments);
router.delete('/deletedocument/:id', protect, authorizeRoles("admin"), deleteDocument);

// Meetings
router.post('/addmeeting', protect, authorizeRoles("admin"), createMeeting);
router.get('/getmeetings', protect, authorizeRoles("admin"), getMeetings);

//Notifications
router.post("/sendnotification", protect, authorizeRoles("admin"), sendNotification);
router.get("/getnotification", protect, authorizeRoles("admin"), getNotification)
router.post("/createnotification",protect, authorizeRoles("admin"), createNotification);

// Analytics
router.get('/analytics', protect, authorizeRoles("admin"), getAnalytics);

// Replace Admin
router.post('/replace-admin', protect, authorizeRoles("admin"), replaceAdmin);

module.exports = router;