const express = require('express');
const router = express.Router();
const { createAmenity,
  getAllAmenities,
  updateAmenity,
  deleteAmenity
} = require('../controllers/superAdmin/amenityController');
// const authMiddleware = require('../middleware/auth');
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Amenity CRUD (accessible to superadmin)
router.use(protect); // all routes below need authentication
router.post('/addamenity', authorizeRoles("superadmin"), createAmenity);
router.get('/getamenities', authorizeRoles("superadmin"), getAllAmenities);
router.put('/updateamenity/:amenityId', authorizeRoles("superadmin"), updateAmenity);
router.delete('/deleteamenity/:amenityId', authorizeRoles("superadmin"), deleteAmenity);

module.exports = router;