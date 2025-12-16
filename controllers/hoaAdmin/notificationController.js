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
      recipients: userId,
    })
      .populate({
        path: "createdBy",
        select: "name role",
        match: { role: "superadmin" }  // filter only where createdBy is superadmin
      })
      .sort({ createdAt: -1 });

    // Remove notifications where populate did not match
    const filteredNotifications = notifications.filter(n => n.createdBy);

    res.status(200).json({
      success: true,
      count: filteredNotifications.length,
      notifications: filteredNotifications,
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

exports.createNotification = async (req, res) => {
  try {
    const adminId = req.user._id;
    const communityId = req.user.community;
    const { title, message, recipients } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: "Please select at least one resident" });
    }

    if (recipients.length === 1) {
      const user = await User.findById(recipients[0]).select("name");

      const notification = await Notification.create({
        title,
        message,
        recipients: [recipients[0]],
        community: communityId,
        createdBy: adminId,
      });

      return res.status(201).json({
        success: true,
        message: "Notification sent to single user",
        notification,
      });
    }

    const notification = await Notification.create({
      title,
      message,
      recipients,     // <-- list of selected resident IDs
      community: communityId,
      createdBy: adminId
    });

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating notification" });
  }
};