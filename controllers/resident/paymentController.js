const Payment = require("../../models/Payment");
const Receipt = require("../../models/Receipt");
const Notification = require("../../models/Notification");
const generatePdfReceipt = require('../../utils/generatePdfReceipt');
const User = require("../../models/User");
const Community = require("../../models/Community");

exports.initiatePayment = async (req, res) => {
  try {
    const { amount, billType, method, userId, communityId } = req.body;

    console.log("Payment Data =>", req.body);

    if (!userId || !communityId) {
      return res.status(400).json({ message: "userId and communityId are required" });
    }

    const transactionId = "TXN-" + Date.now();

    const payment = await Payment.create({
      amount: Number(amount),
      method,
      billType,
      community: communityId,
      user: userId,
      status: "pending",
      transactionId
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
    const pdfPath = await generatePdfReceipt(receipt, user, community);

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

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.download(receipt.pdfPath);
  } catch (err) {
    res.status(500).json({ message: "Error downloading receipt", error: err.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const payments = await Payment.find({ user: userId })
      .populate("community", "name")
      .sort({ transactionDate: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching payment history" });
  }
};