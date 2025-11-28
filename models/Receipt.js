const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
  amount: Number,
  transactionId: String,
  billType: String,
  pdfPath: { type: String },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Receipt", receiptSchema);