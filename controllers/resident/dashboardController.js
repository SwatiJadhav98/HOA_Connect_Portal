const Notification = require("../../models/Notification");
const Complaint = require("../../models/Complaint");
const Announcement = require("../../models/Announcement");
const Amenity = require("../../models/Amenity");
const Poll = require("../../models/Poll");
const Community = require("../../models/Community");

exports.getResidentDashboardCounts = async (req, res) => {
  try {
    const communityId = req.user.community;
    const userId = req.user._id;

    // 1. New Notifications (not marked as read for this user)
    const notifications = await Notification.countDocuments({
      recipients: userId,
      readBy: { $ne: userId },
    });

    // 2. Total Complaints logged by this resident
    const complaints = await Complaint.countDocuments({
      user: userId,
      community: communityId,
    });

    // 3. Total Announcements for this community
    const announcements = await Announcement.countDocuments({
      community: communityId,
    });

    // 4. Total Amenities
    const communityData = await Community.findById(communityId).select(
      "amenities"
    );
    const amenities = await Amenity.countDocuments({
      _id: { $in: communityData.amenities },
      isActive: true,
    });

    // 5. Active Polls for this community
    const polls = await Poll.countDocuments({
      community: communityId
    });

    return res.json({
      notifications,
      complaints,
      announcements,
      amenities,
      polls,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching dashboard counts",
      error: err.message,
    });
  }
};
