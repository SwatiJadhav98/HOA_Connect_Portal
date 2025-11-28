const Announcement = require('../../models/Announcement');

exports.getAnnouncement = async (req, res) => {
  try{
     
    const communityId = req.user.communityId;

    const announcements = await Announcement.findOne({ community: communityId })
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