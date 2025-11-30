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
    const { id } = req.params;
    const { name, description, isActive, maintenanceStatus } = req.body;

    if (!communityId) {
      return res.status(400).json({ message: 'HOA Admin is not assigned to any community.' });
    }

    const amenity = await Amenity.findOneAndUpdate(
      { _id: req.params.id, community: communityId },
      { name, description, isActive, maintenanceStatus },      
      { new: true, runValidators: true }
    );

    if (!amenity) return res.status(404).json({ message: 'Amenity not found' });
    res.status(200).json({ message: 'Amenity updated successfully', amenity });
  } catch (err) {

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