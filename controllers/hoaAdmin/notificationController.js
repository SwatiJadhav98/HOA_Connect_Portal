const User = require("../../models/User");
const Notification = require("../../models/Notification");

exports.sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    const adminId = req.user._id;
    const communityId = req.user.community; // HOA Admin community

    if (!communityId) {
      return res.status(400).json({ message: "Admin is not linked with any community" });
    }

    // Only residents of same community + Admin himself
    const recipients = await User.find(
      { community: communityId, role: "resident" },
      "_id"
    );

    const notification = await Notification.create({
      title,
      message,
      community: communityId,
      recipients: [...recipients.map(r => r._id), adminId], // add admin also
      createdBy: adminId,
    });

    res.status(200).json({
      message: "Notification sent to community residents successfully",
      notification,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.user.community;

    const notifications = await Notification.find({
      community: communityId,
      recipients: userId, // only if user is a recipient
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