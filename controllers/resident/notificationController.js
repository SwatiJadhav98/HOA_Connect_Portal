const User = require("../../models/User");
const Notification = require("../../models/Notification");

exports.getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.user.community;

    const notifications = await Notification.find({
      community: communityId
    })
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};