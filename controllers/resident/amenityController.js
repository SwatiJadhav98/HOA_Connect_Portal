const Amenity = require('../../models/Amenity');
const AmenityBooking = require('../../models/AmenityBooking');

exports.bookAminity = async (req,res) => {

  try{

    const { amenityId, bookingDate} = req.body;
    const userId = req.user._id;
    const communityId = req.user.communityId;

    const amenity = await Amenity.findOne({ _id: amenityId ,community: communityId});

    if(!amenity) return res.status(400).json({ success: false, message: "Amenity not found in Community"});

    if( amenity.maintenanceStatus !== 'available'){
      return res.status(400).json({ success: false, message: "Amenity is currently Not available."});
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
      .populate("amenity"," name description maintenancestatus")
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