const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization &&
      req.headers.authorization.split(" ")[1];
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
      communityId: user.community,   // important line
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

module.exports = { protect, authorizeRoles };
