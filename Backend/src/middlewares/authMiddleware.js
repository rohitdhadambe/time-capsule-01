const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication middleware to protect routes
 * Verifies JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          error: "Authentication required. Please provide a valid token.",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({
          error: "Authentication required. Please provide a valid token.",
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired. Please login again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ error: "Invalid token. Please login again." });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { authenticate };
