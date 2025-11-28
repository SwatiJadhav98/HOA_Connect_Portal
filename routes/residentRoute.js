const express = require('express');
const router = express.Router();

const { getAnnouncement } = require('../controllers/resident/announcementController');
const { submitComplaint, getMyComplaint, updateComplaint } = require('../controllers/resident/complaintController');
const { makePayment, getPaymentHistory} = require('../controllers/resident/paymentController');
const { bookAmenity, getMyBooking } = require('../controllers/resident/amenityController');
const { getProfile, updateProfile} = require('../controllers/resident/profileController');
const { getDocuments, downloadDocuments } = require('../controllers/resident/documentcontoller');
const { getMeetings, rsvpMeeting, joinMeeting } = require('../controllers/resident/meetingController');

//----------Announcement-----------------
router.get("/getannouncements", getAnnouncement);

//--------------Complaints--------------------
router.post("/submitcomplaint", submitComplaint);
router.get("/getmycomplaint", getMyComplaint);
router.put("/updatecompalint/:id", updateComplaint);

//------------------Payment--------------
router.post("/makepayment", makePayment);
rouetr.get("/getpaymenthistory", getPaymentHistory);

//-----------------Amenities-----------------
router.post("/bookamenity", bookAmenity);
router.get("/getmybookamenity", getMyBooking);

//-----------------Profile-----------------
router.put("/updateprofile", updateProfile);
router.get("/getmyprofile", getProfile);

//-----------------Document-----------------
router.get("/documents", getDocuments);
router.get("/downloaddocument", downloadDocuments);

//-----------------Meeting-----------------
router.get("/meeting", getMeetings);
router.put("/meetings/rsvp/:id", rsvpMeeting);
router.get("/meetings/join/:id", joinMeeting);

module.exports = router;