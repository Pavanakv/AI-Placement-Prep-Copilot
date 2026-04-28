const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("TOKEN:", token); // ← add this

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED:", decoded); // ← add this
    
    req.user = await User.findById(decoded.id).select("-password");
    console.log("USER:", req.user); // ← add this

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message); // ← add this
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { protect };