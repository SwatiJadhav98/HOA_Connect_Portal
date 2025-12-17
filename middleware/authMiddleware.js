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
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate temporary password
    const tempPassword = crypto.randomBytes(4).toString("hex");

    // hash it
    user.password = await bcrypt.hash(tempPassword, 10);
    await user.save();

    // transporter (GMAIL APP PASSWORD)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // sender email
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "HOA Connect - Password Reset",
      html: `
            <div style="font-family: Arial; padding: 20px">
            <h2>Password Reset</h2>
            <p>Your temporary password is:</p>
            <h3 style="color: #0f766e">${tempPassword}</h3>
            <p>Please login and change your password immediately.</p>
            </div>
          `,
    });

    res.status(200).json({ message: "Password sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { protect, authorizeRoles, forgotPassword };
