const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 255 },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community"  }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);