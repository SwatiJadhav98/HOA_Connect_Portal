const express = require('express');
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { registerResidentSelf } = require('../controllers/resident/registrationController');
const { getAnnouncement } = require('../controllers/resident/announcementController');
const { submitComplaint, getMyComplaint, updateComplaint } = require('../controllers/resident/complaintController');
// const { makePayment, getPaymentHistory} = require('../controllers/resident/paymentController');
const { bookAminity, getMyBooking } = require('../controllers/resident/amenityController');
const { getProfile, updateProfile} = require('../controllers/resident/profileController');
const { getDocuments, downloadDocument } = require('../controllers/resident/documentcontoller');
const { getMeetings, rsvpMeeting, joinMeeting } = require('../controllers/resident/meetingController');
const { initiatePayment , paymentSuccess, downloadReceipt } = require("../controllers/resident/paymentController");

//-----------------Register-------------------
router.post("/register", registerResidentSelf);

//----------Announcement-----------------
router.get(
  "/getannouncements",
  protect,  
  authorizeRoles("resident"), 
  getAnnouncement
);

//--------------Complaints--------------------
router.post("/submitcomplaint",protect, authorizeRoles("resident"), submitComplaint);
router.get("/getmycomplaint", protect, authorizeRoles("resident"), getMyComplaint);
router.put("/updatecompalint/:id",protect, authorizeRoles("resident"), updateComplaint);

// //------------------Payment--------------
// router.post("/makepayment", makePayment);
// rouetr.get("/getpaymenthistory", getPaymentHistory);

//-----------------Amenities-----------------
router.post("/bookamenity",protect, authorizeRoles("resident"), bookAminity);
router.get("/getmybookamenity",protect, authorizeRoles("resident"), getMyBooking);

//-----------------Profile-----------------
router.put("/updateprofile",protect, authorizeRoles("resident"), updateProfile);
router.get("/getmyprofile",protect, authorizeRoles("resident"), getProfile);

//-----------------Document-----------------
router.get("/documents",protect, authorizeRoles("resident"), getDocuments);
router.get("/downloaddocument",protect, authorizeRoles("resident"), downloadDocument);

//-----------------Meeting-----------------
router.get("/meeting",protect, authorizeRoles("resident"), getMeetings);
router.put("/meetings/rsvp/:id",protect, authorizeRoles("resident"), rsvpMeeting);
router.get("/meetings/join/:id",protect, authorizeRoles("resident"), joinMeeting);

//--------------------Payment------------------
router.post("/payment/initiate",protect, authorizeRoles("resident"), initiatePayment);
router.put("/payment/:id/success",protect, authorizeRoles("resident"), paymentSuccess);
router.get("/payment/receipt/:id",protect, authorizeRoles("resident"), downloadReceipt);   

module.exports = router;