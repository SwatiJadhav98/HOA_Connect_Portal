const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Community = require("../models/Community");
const ROLES = require("../config/roles");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNo, houseNumber, communityId } =
      req.body;
    const requester = req.user;

    //Validate Role
    if (!role || ![ROLES.ADMIN, ROLES.RESIDENT].includes(role)) {
      return res
        .status(400)
        .json({
          message: "Invalid or missing role. Only admin or resident allowed",
        });
    }
    //Only SuperAdmin creates an Admin
    // if (role === ROLES.ADMIN && requester.role !== ROLES.SUPERADMIN) {
    //   return res.status(403).json({ message: 'Only SuperAdmin can create Admins' });
    // }
    if (role === ROLES.ADMIN) {
      if (requester.role !== ROLES.SUPERADMIN) {
        return res
          .status(403)
          .json({ message: "Only SuperAdmin can create Admins." });
      }
    }
    //Only Admin creates Resident
    // if (role === ROLES.ADMIN && requester.role !== ROLES.SUPERADMIN) {
    //   return res.status(403).json({ message: 'Only SuperAdmin can create Admins' });
    // }

    // if (role === ROLES.RESIDENT) {
    //   if (requester.role !== ROLES.ADMIN) {
    //     return res
    //       .status(403)
    //       .json({ message: "Only Admin can create Residents." });
    //   }

    //   // Resident should automatically get admin’s community
    //   if (!req.user?.communityId) {
    //     return res
    //       .status(400)
    //       .json({ message: "Admin is not assigned to any community." });
    //   }
    // }

    //Duplicate email checking
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    // Variable must be defined before use
    let assignedCommunityId = null;

    // For Resident: automatically inherit admin's community
    if (role === ROLES.RESIDENT) {
      if (!requester.communityId) {
        return res
          .status(400)
          .json({ message: "Admin is not assigned to any community." });
      }
      assignedCommunityId = requester.communityId;
    }

    // For Admin: community assignment optional (assign later)
    if (role === ROLES.ADMIN) {
      if (communityId) {
        const community = await Community.findById(communityId);
        if (!community) {
          return res.status(400).json({ message: "Community not found." });
        }
        assignedCommunityId = communityId;
      }
    }

    // Check if community exists
    const community = await Community.findOne({ communityId });
    if (!community)
      return res.status(400).json({ message: "Community not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    // if (!req.user?.communityId) {
    //   return res.status(400).json({ message: "Community not found in user" });
    // }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNo,
      houseNumber,
      communityId: assignedCommunityId,
    });

    await user.save();

    // If Admin, link to community
    if (role === ROLES.ADMIN && assignedCommunityId) {
      const community = await Community.findById(assignedCommunityId);
      if (community) {
        community.userId = user._id;
        await community.save();
      }
    }

    // Do not send password back
    const safeUser = (({
      _id,
      name,
      email,
      role,
      phoneNo,
      houseNumber,
      communityId,
    }) => ({ _id, name, email, role, phoneNo, houseNumber, communityId }))(
      user
    );

    res
      .status(201)
      .json({ message: `${role} registered successfully`, user: safeUser });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and Password are required." });

    const user = await User.findOne({ email }).populate("community");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    res.json({ message: "Login Successful", token, role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

// Get all HOA Admins (users with role = "admin")
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" })
      .populate("community") // optional if you want to include community details
      .select("-password"); // exclude password field for security

    if (!admins || admins.length === 0) {
      return res.status(404).json({ message: "No admins found" });
    }

    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.registerAdmin = async (req, res) => {
  try {
    const requester = req.user; // must be SUPERADMIN
    const { name, email, password, phoneNo, houseNumber, communityId } = req.body;

    if (requester.role !== ROLES.SUPERADMIN) {
      return res.status(403).json({ message: "Only SuperAdmin can register Admins" });
    }

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
      role: ROLES.ADMIN,
      phoneNo,
      houseNumber,
      communityId,
    });

    community.user = user._id;
    await community.save();

    res.status(201).json({
      message: "Admin registered successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error: error.message });
  }
};
