const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const { getResidentDashboardCounts } = require('../controllers/resident/dashboardController');
const { registerResidentSelf } = require('../controllers/resident/registrationController');
const { getAnnouncement } = require('../controllers/resident/announcementController');
const { submitComplaint, getMyComplaint, updateComplaint } = require('../controllers/resident/complaintController');
// const { makePayment, getPaymentHistory} = require('../controllers/resident/paymentController');
const { bookAminity, getMyBooking, getAmenitiesByResident } = require('../controllers/resident/amenityController');
const { getProfile, updateProfile} = require('../controllers/resident/profileController');
const { getDocuments, downloadDocument } = require('../controllers/resident/documentcontoller');
const { getMeetingsByResident, rsvpMeeting, joinMeeting } = require('../controllers/resident/meetingController');
const { initiatePayment , paymentSuccess, downloadReceipt, getPaymentHistory, cancelPayment } = require("../controllers/resident/paymentController");
const { getNotification } = require('../controllers/resident/notificationController');
const {votePoll, getPolls } = require('../controllers/resident/pollController');

//-----------------Register-------------------
router.post("/register", registerResidentSelf);

//----------------------Dashboard-----------------
router.get('/dashboard/counts', protect, authorizeRoles("resident"), getResidentDashboardCounts);

//----------Announcement-----------------
router.get("/getannouncements", protect, authorizeRoles("resident"), getAnnouncement);

//--------------Complaints--------------------
router.post("/submitcomplaint",protect, authorizeRoles("resident"), submitComplaint);
router.get("/getmycomplaint", protect, authorizeRoles("resident"), getMyComplaint);
router.put("/updatecompalint/:id",protect, authorizeRoles("resident"), updateComplaint);

// //------------------Payment--------------
// router.post("/makepayment", makePayment);

//-----------------Amenities-----------------
router.post("/bookamenity",protect, authorizeRoles("resident"), bookAminity);
router.get("/getmybookamenity",protect, authorizeRoles("resident"), getMyBooking);
router.get('/getamenitiesbyresident',protect, authorizeRoles("resident"), getAmenitiesByResident);

//-----------------Profile-----------------
router.put("/updateprofile",protect, authorizeRoles("resident"), updateProfile);
router.get("/getmyprofile",protect, authorizeRoles("resident"), getProfile);

//-----------------Document-----------------
router.get("/documents",protect, authorizeRoles("resident"), getDocuments);
router.get("/downloaddocument/:id",protect, authorizeRoles("resident"), downloadDocument);

//-----------------Meeting-----------------
router.get("/getmeetingbyresident",protect, authorizeRoles("resident"), getMeetingsByResident);
router.put("/meetings/rsvp/:id",protect, authorizeRoles("resident"), rsvpMeeting);
router.get("/meetings/join/:id",protect, authorizeRoles("resident"), joinMeeting);

//--------------------Payment------------------
router.post("/payment/initiate",protect, authorizeRoles("resident"), initiatePayment);
router.put("/payment/:id/success",protect, authorizeRoles("resident"), paymentSuccess);
router.get("/payment/receipt/:transactionId",protect, authorizeRoles("resident"), downloadReceipt);   
router.get("/getpaymenthistory",protect, authorizeRoles("resident"), getPaymentHistory);
router.put("/payment/:id/cancel", protect, authorizeRoles("resident"), cancelPayment);

//--------------------Notification----------------------
router.get("/getnotification", protect, authorizeRoles("resident"), getNotification);

//----------------------Poll Vote------------------------
router.get('/getpolls', protect, authorizeRoles("resident"), getPolls);
router.post('/votepoll/:id', protect, authorizeRoles("resident"), votePoll);

module.exports = router;