// const mongoose = require('mongoose');

// const AmenitySchema = new mongoose.Schema({
//   name: { type: String, required: true, maxlength: 100 },
//   description: { type: String, maxlength: 500 },
//   isActive: { type: Boolean, default: true },
//   bookings: { type: mongoose.Schema.Types.ObjectId, ref: "AmenityBooking" },
//   // community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" } 
// });

// module.exports = mongoose.model('Amenity', AmenitySchema);

const mongoose = require('mongoose');

const AmenitySchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  isActive: { type: Boolean, default: true },
  maintenanceStatus: {
    type: String,
    enum: ['available', 'under_maintenance', 'closed'],
    default: 'available'
  },
  // community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community'},
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AmenityBooking' }]
});

module.exports = mongoose.model('Amenity', AmenitySchema);