const User = require('../../models/User');
const bcrypt = require('bcryptjs');

exports.createResident = async (req, res) => {
  try {
    const { name, email, password, phoneNo, houseNumber } = req.body;

    // console.log("🟢 Controller received user:", req.user);
    const communityId = req.user.community || req.user.communityId;
    if (!communityId) {
      // console.log("🚨 Admin missing community:", req.user);
      return res.status(400).json({ message: 'HOA Admin is not assigned to any community.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const resident = new User({
      name,
      email,
      password: hashedPassword,
      phoneNo,
      houseNumber,
      role: 'resident',
      community: communityId,
      isResident: true
    });

    await resident.save();
    res.status(201).json({ message: 'Resident created successfully', resident });
  } catch(err){
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getResidents = async (req, res) => {
  try {
    const communityId = req.user.community;

    const residents = await User.find({ community: communityId, role: 'resident' }).select('-password');
    res.status(200).json(residents);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await User.findByIdAndUpdate(
      {_id: id, community: req.user.community, role: 'resident' },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!resident) return res.status(404).json({ message: 'Resident not found' });

    res.status(200).json({ message: 'Resident updated successfully', resident });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteResident = async (req, res) => {
  try {
    const { id } = req.params;
    const communityId = req.user.community;

    const resident = await User.findOne({
      _id: id,
      community: communityId,
      role: "resident",
    });

    if (!resident) return res.status(404).json({ message: 'Resident not found' });
    
    await Promise.all([
      // remove resident from notifications
      Notification.updateMany(
        { recipients: id },
        { $pull: { recipients: id } }
      ),

      // delete complaints created by resident
      Complaint.deleteMany({ createdBy: id }),

      // delete payments of resident
      Payment.deleteMany({ user: id }),
    ]);
    await User.deleteOne({ _id: id });
    
    res.status(200).json({
      success: true,
      message: "Resident and all related data deleted successfully",
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};