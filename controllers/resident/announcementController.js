const Announcement = require('../../models/Announcement');

exports.getAnnouncement = async (req, res) => {
  try{
     console.log("User in request:", req.user);
    const communityId = req.user?.community;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: "communityId not found in user token"
      });
    }

    const announcements = await Announcement.find({ community: communityId })
      .populate("createdBy", "name")
      .sort({createdAt: -1});

    res.status(200).json({
      success: true,
      announcements
    });

  }catch(error){
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}