const express = require("express");
const router = express.Router();
const Community = require("../../models/Community");
const User = require("../../models/User");
const Complaint = require("../../models/Complaint");
const Announcement = require("../../models/Announcement");
const Amenity = require("../../models/Amenity");
const Payment = require("../../models/Payment");
const Notification = require("../../models/Notification");

exports.getHoaAdminDashboard = async (req, res) => {
  try {
    const communityId = req.user.community; // Admin's community

    // Get superadmins
    const superAdmins = await User.find({ role: "superadmin" }).select("_id");

    // Count notifications created by superadmin
    const notifications = await Notification.countDocuments({
      community: communityId,
      createdBy: { $in: superAdmins.map((u) => u._id) },
    });

    // Count residents in this community
    const residents = await User.countDocuments({ role: "resident", community: communityId });

    // Count HOA admins in this community
    const hoaAdmins = await User.countDocuments({ role: "admin", community: communityId });

    // Count complaints in this community
    const complaints = await Complaint.countDocuments({ community: communityId });

    // Count announcements in this community
    const announcements = await Announcement.countDocuments({ community: communityId });

    // Count amenities in this community
    const community = await Community.findById(communityId).populate("amenities");
    const amenitiesCount = community?.amenities?.length || 0;

    // Sum payments in this community
    const paymentsAgg = await Payment.aggregate([
      { $match: { community: communityId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalPayments = paymentsAgg[0]?.total || 0;

    res.json({
      success: true,
      data: {
        notifications,
        residents,
        hoaAdmins,
        complaints,
        announcements,
        amenities: amenitiesCount,
        totalPayments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.getHoaAdminDashboard = async (req, res) => {
//   try {
//     // Total stats
//     const communities = await Community.countDocuments();
//     const residents = await User.countDocuments({ role: "resident" });
//     const complaints = await Complaint.countDocuments();
//     const announcements = await Announcement.countDocuments();
//     const amenities = await Amenity.countDocuments();
//     const totalPaymentsAgg = await Payment.aggregate([
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);
//     const totalPayments = totalPaymentsAgg[0]?.total || 0;

//     // Monthly payments aggregation
//     const paymentHistory = await Payment.aggregate([
//       {
//         $group: {
//           _id: { $month: "$createdAt" }, // group by month
//           amount: { $sum: "$amount" },
//         },
//       },
//       { $sort: { "_id": 1 } }, // sort by month
//     ]);

//     // Convert _id to month name
//     const monthNames = [
//       "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//     ];

//     const formattedPaymentHistory = paymentHistory.map((p) => ({
//       month: monthNames[p._id - 1],
//       amount: p.amount,
//     }));

//     res.json({
//       success: true,
//       data: {
//         communities,
//         residents,
//         hoaAdmins,
//         complaints,
//         announcements,
//         amenities,
//         totalPayments,
//         paymentHistory: formattedPaymentHistory,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };