const Document = require("../../models/Document");
const path = require("path");
const fs = require("fs");

exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ community: req.user.community })
      .sort({ createdAt: -1 });

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents", error: err.message });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      community: req.user.community // ensure resident belongs to same community
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.join(__dirname, "../../uploads/documents", document.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, document.title + path.extname(filePath)); // sets file name on download
  } catch (err) {
    res.status(500).json({ message: "Error downloading document", error: err.message });
  }
};
