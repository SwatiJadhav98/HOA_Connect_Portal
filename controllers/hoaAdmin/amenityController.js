const Amenity = require('../../models/Amenity');
const Community = require('../../models/Community');

exports.getAmenities = async (req, res) => {
  try {

    const communityId = req.user.community;

    const community = await Community.findById(communityId).populate("amenities");
    
    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }
    
    // const amenities = await Amenity.find({ community: communityId });
    res.status(200).json(community.amenities);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.updateAmenity = async (req, res) => {
  try {
    const communityId = req.user.community;
    const { maintenanceStatus } = req.body;
    const { id } = req.params; // amenity id

    // 1️⃣ find community that contains the amenity
    const community = await Community.findOne({
      _id: communityId,
      amenities: id
    });

    if (!community) {
      return res.status(404).json({
        message: "Amenity not found for this community (ID mismatch)"
      });
    }

    // 2️⃣ update amenity safely
    const amenity = await Amenity.findByIdAndUpdate(
      id,
      { maintenanceStatus },
      { new: true }
    );

    res.status(200).json({
      message: "Maintenance status updated successfully",
      amenity
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating amenity" });
  }
};

exports.getAmenityById = async (req, res) => {
  try {
    const communityId = req.user.community;
    const { id } = req.params;

    const amenity = await Amenity.findOne({ _id: id, community: communityId });
    if (!amenity) {
      return res.status(404).json({ message: 'Amenity not found in your community.' });
    }

    res.status(200).json({ amenity });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};