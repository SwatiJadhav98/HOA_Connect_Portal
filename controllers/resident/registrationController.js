const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Community = require("../../models/Community");
const ROLES = require("../../config/roles");

// --- Resident Self Registration (No Token) ---
exports.registerResidentSelf = async (req, res) => {
  try {
    const { name, email, password, phoneNo, houseNumber, communityId } = req.body;

    // Only Resident allowed
    const role = ROLES.RESIDENT;

    if (!communityId)
      return res.status(400).json({ message: "Community ID is required" });

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(400).json({ message: "Community not found" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNo,
      houseNumber,
      community: req.body.communityId,
      isResident: true
    });

    res.status(201).json({
      message: "Resident registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNo: user.phoneNo,
        houseNumber: user.houseNumber,
        communityId: user.community,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Error registering resident", error: error.message });
  }
};