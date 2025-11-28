const Payment = require("../../models/Payment");
const Receipt = require("../../models/Receipt");
const Notification = require("../../models/Notification");
// const generateReceiptPDF= require('../../utils/generateReceiptPDF');
// const generateReceiptPDF = require('../../utils/generateReceiptPDF');
const User = require("../../models/User");
const Community = require("../../models/Community");

exports.initiatePayment = async (req, res) => {
  try {
    const { amount, billType, method } = req.body;

    const payment = await Payment.create({
      amount,
      method,
      billType,
      community: req.user.community,
      user: req.user._id,
      status: "pending",
    });

    res.json({
      message: "Payment initiated",
      paymentId: payment._id,
      transactionId: payment.transactionId,
    });
  } catch (err) {
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
};

exports.paymentSuccess = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "completed", transactionDate: new Date() },
      { new: true }
    );

    const receipt = await Receipt.create({
      paymentId: payment._id,
      user: payment.user,
      community: payment.community,
      amount: payment.amount,
      transactionId: payment.transactionId,
      billType: payment.billType
    });

    const user = await User.findById(payment.user);
    const community = await Community.findById(payment.community);

    // Generate PDF
    const pdfPath = await generateReceiptPDF(receipt, user, community);

    // Save path to DB
    receipt.pdfPath = pdfPath;
    await receipt.save();

    res.json({
      message: "Payment completed & receipt generated",
      receiptId: receipt._id,
      pdf: pdfPath
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating payment", error: err.message });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt || receipt.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.download(receipt.pdfPath);
  } catch (err) {
    res.status(500).json({ message: "Error downloading receipt", error: err.message });
  }
};

//Old
// exports.createPayment = async (req, res) => {
//   try {
//     const { amount, method } = req.body;

//     const userId = req.user._id;
//     const coomunityId = req.user.coomunityId;

//     const payment = await Payment.create({
//       amount,
//       method,
//       user: userId,
//       community: communityId,
//       status: "completed",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Payment completed successfully",
//       payment,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getPaymentHistory = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const payments = await Payment.find({ user: userId }).sort({
//       transactionDate: -1,
//     });

//     res.status(200).json({
//       success: true,
//       payments,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
