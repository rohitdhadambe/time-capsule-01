require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const capsuleRoutes = require("./routes/capsuleRoutes");
const expirationService = require("./services/expirationService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/capsules", capsuleRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Database connection and server start
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Sync database models
    await sequelize.sync();
    console.log("Database connected successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Start the expiration service (cron job)
    expirationService.startExpirationChecks();
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();

module.exports = app; // For testing purposes
