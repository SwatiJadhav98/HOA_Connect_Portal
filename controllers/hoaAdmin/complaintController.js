const Complaint = require('../../models/Complaint');

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ community: req.user.community }).populate('user', 'name email');
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching complaints', error: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { status } = req.body; // "In Progress" | "Resolved"

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.updatedAt = Date.now();
    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Complaint status updated",
      complaint
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};