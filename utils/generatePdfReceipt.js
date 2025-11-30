const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generatePdfReceipt = async (receipt, user, community) => {
  return new Promise((resolve, reject) => {
    const fileName = `receipt_${receipt.transactionId}.pdf`;
    const filePath = path.join("uploads/receipts", fileName); // relative to root

    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text(`${community.name} - Payment Receipt`, { align: "center" });
    doc.moveDown();

    // Receipt Info
    doc.fontSize(12).text(`Receipt No: ${receipt._id}`);
    doc.text(`Transaction ID: ${receipt.transactionId}`);
    doc.text(`Date: ${new Date(receipt.generatedAt).toLocaleString()}`);
    doc.moveDown();

    // User Info
    doc.text(`Paid By: ${user.name}`);
    doc.text(`House No: ${user.houseNumber}`);
    doc.moveDown();

    // Payment Info
    doc.text(`Bill Type: ${receipt.billType}`);
    doc.text(`Amount Paid: ₹${receipt.amount}`, { bold: true });
    doc.moveDown(2);

    doc.text("Thank you for your payment!", { align: "center" });
    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = generatePdfReceipt;