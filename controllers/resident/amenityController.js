const Amenity = require('../../models/Amenity');
const AmenityBooking = require('../../models/AmenityBooking');
const Community = require('../../models/Community');

exports.bookAminity = async (req,res) => {

  try{

    const { amenityId, bookingDate} = req.body;
    const userId = req.user._id;
    const communityId = req.user.community;

    // const amenity = await Amenity.findOne({ _id: amenityId ,community: communityId});

    // Load community with its amenities
    const community = await Community.findById(communityId).populate("amenities");
    if (!community) return res.status(400).json({ message: "Community not found" });

    // Check amenity exists inside community.amenities
    const amenity = community.amenities.find(a => a._id.toString() === amenityId);
    if (!amenity) return res.status(400).json({ message: "Amenity not found in your Community" });

    if (amenity.maintenanceStatus !== "available") {
      return res.status(400).json({ message: "Amenity is currently not available" });
    }

    const alreadyBooked = await AmenityBooking.findOne({
      amenity: amenityId,
      user: userId
    });

    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: "You have already booked this amenity."
      });
    }

    const booking = await AmenityBooking.create({
      amenity: amenityId,
      user: userId,
      bookingDate
    });

    res.status(201).json({
      success: true,
      message: "Amenity Booked Successfully",
      booking
    });

  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getMyBooking = async (req, res) => {
  try{

    const userId = req.user._id;

    const booking = await AmenityBooking.find({ user: userId})
      .populate("amenity"," name description maintenanceStatus")
      .sort({ createdAt: -1});

    res.status(200).json({
      success: true,
      booking
    });
    
  }catch(error){
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

exports.getAmenitiesByResident = async (req, res) => {
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
