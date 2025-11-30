const express = require("express");
const router = express.Router();
const Community = require("../../models/Community");
const User = require("../../models/User");
const Complaint = require("../../models/Complaint");
const Announcement = require("../../models/Announcement");
const Amenity = require("../../models/Amenity");
const Payment = require("../../models/Payment");

exports.getHoaAdminDashboard =  async (req, res) => {
  try {
    const [communities, residents, hoaAdmins, complaints, announcements, amenities, payments] =
      await Promise.all([
        Community.countDocuments(),
        User.countDocuments({ role: "resident" }),
        User.countDocuments({ role: "admin" }),
        Complaint.countDocuments(),
        Announcement.countDocuments(),
        Amenity.countDocuments(),
        Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
      ]);

    res.json({
      success: true,
      data: {
        communities,
        residents,
        hoaAdmins,
        complaints,
        announcements,
        amenities,
        totalPayments: payments[0]?.total || 0,
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