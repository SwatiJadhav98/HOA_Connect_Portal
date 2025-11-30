const Complaints = require("../../models/Complaint");

//--------------Submit Complaint-------------------
exports.submitComplaint = async (req, res) => {
  try {

    const { subject, description } = req.body;
    const communityId = req.user.community;
    const userId = req.user._id;

    const complaint = await Complaints.create({
      subject,
      description,
      user: userId,
      community: communityId,
    });

    res.status(201).json({
      success: true,
      message: "Compliant Submitted Successfully!",
      complaint
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//--------------Get My Complaint-------------------
exports.getMyComplaint = async (req, res) => {

  try{

    const userId = req.user._id;

    const complaint = await Complaints.find({ user: userId}).sort({ creaedAt: -1});

    res.status(200).json({
      success: true,
      complaint
    });

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

//--------------Update Complaint Status-------------------
exports.updateComplaint = async (req, res) => {
  try{

    const userId = req.user._id;
    const communityId = req.params.id;

    const complaint = await Complaints.findOne({ _id: communityId, user: userId});

    if(!complaint){
      res.status(400).json({ success: false, message: "Complaint Not Found!"});
    }

    if(complaint.status != "Pending"){
      return res.status(400).json({
        success: false,
        message: "Only complaints with status 'Pending' can be updated"
      });
    }

    complaint.subject = req.body.subject ?? complaint.subject;
    complaint.description = req.body.description ?? complaint.description;
    complaint.updatedAt = Date.now();
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      complaint
    });

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}