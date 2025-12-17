const User = require("../../models/User");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await User.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ MATCH FRONTEND FIELD NAMES
    const { name, email, phoneNo, houseNumber } = req.body;

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phoneNo,
        houseNumber,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
