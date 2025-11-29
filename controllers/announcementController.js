const Announcement = require("../models/Announcement");

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.user?.communityId) {
      return res.status(400).json({ message: "Admin must belong to a community" });
    }

    const announcement = await Announcement.create({
      title,
      description,
      communityId: req.user.communityId,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Announcement created", announcement });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const communityId = req.user.community;

    if (!communityId) {
      return res.status(400).json({ message: "HOA Admin is not assigned to any community." });
    }

    const announcements = await Announcement.find({ community: communityId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnnouncementsByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const announcements = await Announcement.find({ communityId: communityId })
      .sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};