const Community = require("../../models/Community");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const Amenity = require("../../models/Amenity");
const bcrypt = require("bcryptjs");
const Payment = require("../../models/Payment");

//--------------------Dashboard-------------------
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    const totalCommunities = await Community.countDocuments();
    const totalHOAAdmins = await User.countDocuments({ role: "admin" });
    const totalAmenities = await Amenity.countDocuments();

    res.status(200).json({
      success: true,
      totalCommunities,
      totalHOAAdmins,
      totalAmenities,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard stats",
      error: error.message,
    });
  }
};

// -------------------- CREATE COMMUNITY --------------------
exports.createCommunity = async (req, res) => {
  try {
    if (req.user.role !== "superadmin")
      return res.status(403).json({ message: "Access denied" });

    const {
      communityName,
      address,
      amenities,
      isResident,
      hoaAdminName,
      hoaAdminEmail,
      hoaAdminPassword,
      hoaAdminPhoneNumber,
    } = req.body;

    // Check if HOA Admin email already exists
    const existingAdmin = await User.findOne({ email: hoaAdminEmail });
    if (existingAdmin)
      return res
        .status(400)
        .json({ message: "HOA Admin with this email already exists" });

    // Create HOA Admin
    const hashedPassword = await bcrypt.hash(hoaAdminPassword, 10);
    const isResidentValue = isResident === "true" || isResident === true;
    const hoaAdmin = new User({
      name: hoaAdminName,
      email: hoaAdminEmail,
      password: hashedPassword,
      phoneNo: hoaAdminPhoneNumber,
      isResident: isResidentValue,
      role: "admin",
    });
    await hoaAdmin.save();

    // Create Community
    const community = new Community({
      name: communityName,
      address,
      amenities,
      user: hoaAdmin._id,
    });
    await community.save();

    // Link HOA Admin to Community
    hoaAdmin.community = community._id;
    await hoaAdmin.save();

    res
      .status(201)
      .json({
        message: "Community and HOA Admin created successfully",
        community,
        hoaAdmin,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- GET ALL COMMUNITIES ----------------
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
    .populate(
      "user",
      "name email phoneNo"
    ).populate({
        path: 'amenities',
        select: 'name description isActive maintenanceStatus'
      });
    res.status(200).json({ communities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- DELETE COMMUNITY ----------------
exports.deleteCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    // Delete associated HOA Admin
    if (community.user) await User.findByIdAndDelete(community.user);

    // Delete Community
    await Community.findByIdAndDelete(communityId);

    res
      .status(200)
      .json({
        message: "Community and associated HOA Admin deleted successfully",
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- REPLACE HOA ADMIN ----------------
exports.replaceHoaAdmin = async (req, res) => {
  try {
    const { communityId } = req.params;
    const {
      newAdminName,
      newAdminEmail,
      newAdminPassword,
      newAdminPhoneNo,
      amenities,           // array of amenity IDs to set
    } = req.body;

    const community = await Community.findById(communityId);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    // Delete existing HOA Admin
    if (community.user) await User.findByIdAndDelete(community.user);

    // Create new HOA Admin
    const hashedPassword = await bcrypt.hash(newAdminPassword, 10);
    const newHoaAdmin = new User({
      name: newAdminName,
      email: newAdminEmail,
      password: hashedPassword,
      role: "admin",
      phoneNo: newAdminPhoneNo,
      community: community._id,
    });
    await newHoaAdmin.save();
    const savedAdmin = await User.findById(newHoaAdmin._id);
    // Update community: link new admin + replace amenities
    community.user = newHoaAdmin._id;
    if (Array.isArray(amenities)) {
      community.amenities = amenities;
    }
    await community.save();

    res.status(200).json({
      message: "HOA Admin and community amenities updated successfully",
      community,
      newHoaAdmin: savedAdmin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ---------------- VIEW GLOBAL PAYMENT REPORTS ----------------
exports.getGlobalPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("community", "name address");
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    res.status(200).json({ totalAmount, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------- SEND NOTIFICATION TO COMMUNITY --------------------
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, communityId } = req.body;

    if (!communityId) {
      return res.status(400).json({ message: "communityId is required" });
    }

    // Find ONLY Admin(s) of this selected community
    const recipients = await User.find(
      { community: communityId, role: "admin" },
      "_id"
    );

    if (recipients.length === 0) {
      return res.status(404).json({ message: "No admin found for this community" });
    }

    const notification = new Notification({
      title,
      message,
      recipients: recipients.map((u) => u._id),
      community: communityId,
      createdBy: req.user._id, // super admin
    });

    await notification.save();

    res.status(200).json({
      message: "Notification sent successfully to the admin(s) of this community",
      sentTo: recipients.length,
      recipients: recipients.map((u) => u._id),
      notification,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// exports.getNotification = async (req, res) => {
//   try {
//     const userId = req.user._id; // user from protect middleware

    
//     const notifications = await Notification.find({ recipients: userId })
//       .populate("createdBy", "name")     // show who created notification
//       .sort({ createdAt: -1 });          // latest first

//     res.status(200).json({
//       success: true,
//       count: notifications.length,
//       notifications,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch notifications",
//       error: error.message,
//     });
//   }
// };

exports.getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("createdBy", "name")
      .populate("community", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
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

