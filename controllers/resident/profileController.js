const User = require("../../models/User");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const profile = await User.findById(userId).select("-paasword");

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

    const { name, email, phone, house } = req.body;

    const updateProfile = await User.findByIdAndUpdate(userId, {
      name: name,
      email: email,
      phoneNumber: phone,
      houseNumber: house,
      updatedAt: Date.now(),
    },
    { new: true}
    ).select("-password");

    // await User.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updateProfile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
