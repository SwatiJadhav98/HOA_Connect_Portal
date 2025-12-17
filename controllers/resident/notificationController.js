const User = require("../../models/User");
const Notification = require("../../models/Notification");

exports.getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.user.community;

    const hoaAdmins = await User.find({
      community: communityId,
      role: "admin",
    }).select("_id");

    const adminIds = hoaAdmins.map(admin => admin._id);

    const notifications = await Notification.find({
      community: communityId,
      createdBy: { $in: adminIds },
      recipients: userId,
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