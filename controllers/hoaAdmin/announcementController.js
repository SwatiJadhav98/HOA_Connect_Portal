const Announcement = require('../../models/Announcement');

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, description } = req.body;

    const communityId = req.user.community;

    if (!communityId) {
      return res.status(400).json({ message: "Admin must belong to a community" });
    }

    const announcement = await Announcement.create({
      title,
      description,
      community: communityId,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Announcement created", announcement });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};