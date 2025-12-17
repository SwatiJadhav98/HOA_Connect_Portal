const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const protect = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, Authorization Denied!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // expose user data and map community -> communityId
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNo: user.phoneNo,
      houseNumber: user.houseNumber,
      community: user.community, // important line
      isResident: user.isResident,
    };

    console.log("✅ Logged-in User in protect =>", req.user);

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token is not valid!", error: err.message });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

const forgotPassword = async (req, res) => {
  try {
    const { email, phoneNo, newPassword } = req.body;

    if (!email || !phoneNo || !newPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Match email + house number
    const user = await User.findOne({ email, phoneNo });

    if (!user) {
      return res.status(404).json({
        message: "Invalid email or house number",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully. Please login with new password.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { protect, authorizeRoles, forgotPassword };
