const Document = require('../../models/Document');
const fs = require('fs');
const path = require('path');

//Upload Document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only HOA Admins can upload documents.' });
    }

    if (!req.user.community) {
      return res.status(400).json({ message: 'HOA Admin is not assigned to any community.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { title, description } = req.body;
    const savedFileName = req.file.filename;
    const newDoc = new Document({
      title,
      description,
      filePath: savedFileName,
      fileType: req.file.mimetype,
      user: req.user._id,
      community: req.user.community
    });

    await newDoc.save();
    res.status(201).json({ message: 'Document uploaded successfully', document: newDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading document', error: err.message });
  }
};

//Get All Documents (in same community)
exports.getDocuments = async (req, res) => {
  try {
    if (!req.user || !req.user.community) {
      return res.status(400).json({ message: 'User is not assigned to any community.' });
    }

    const documents = await Document.find({ community: req.user.community })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ message: 'Documents fetched successfully', documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
};

//Delete Document
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Only HOA Admin who uploaded or any HOA Admin from same community can delete
    if (req.user.role !== 'admin' || !req.user.community.equals(doc.community)) {
      return res.status(403).json({ message: 'Unauthorized to delete this document.' });
    }

    // Delete the file from storage
    fs.unlink(path.join(__dirname, '../../', doc.filePath), (err) => {
      if (err) console.error('File delete error:', err);
    });

    await doc.deleteOne();
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting document', error: err.message });
  }
};