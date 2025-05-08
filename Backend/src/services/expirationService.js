const cron = require("node-cron");
const { Op } = require("sequelize");
const Capsule = require("../models/Capsule");

/**
 * Check for and mark expired capsules
 * Capsules expire 30 days after their unlock date
 */
const checkExpiredCapsules = async () => {
  try {
    console.log("Running expired capsules check...");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find all capsules that should be expired but aren't marked as such yet
    // (unlock_at older than 30 days ago AND is_expired = false)
    const expiredCapsules = await Capsule.findAll({
      where: {
        unlock_at: {
          [Op.lt]: thirtyDaysAgo,
        },
        is_expired: false,
      },
    });

    if (expiredCapsules.length > 0) {
      console.log(
        `Found ${expiredCapsules.length} capsules to mark as expired`
      );

      // Update all expired capsules
      await Promise.all(
        expiredCapsules.map((capsule) => capsule.update({ is_expired: true }))
      );

      console.log("Expired capsules marked successfully");
    } else {
      console.log("No expired capsules found");
    }
  } catch (error) {
    console.error("Error checking for expired capsules:", error);
  }
};

/**
 * Start the cron job to check for expired capsules
 * Default: Run every day at midnight
 */
const startExpirationChecks = () => {
  // Schedule: Run at midnight every day (0 0 * * *)
  const cronSchedule = process.env.EXPIRATION_CRON || "0 0 * * *";

  // Also run once at startup
  checkExpiredCapsules();

  // Schedule the cron job
  const job = cron.schedule(cronSchedule, () => {
    checkExpiredCapsules();
  });

  console.log(
    `Expiration check service started with schedule: ${cronSchedule}`
  );

  return job;
};

/**
 * Manual execution function for testing or CLI usage
 */
const runExpirationCheckManually = async () => {
  await checkExpiredCapsules();
};

// If this file is run directly (not imported), execute the check
if (require.main === module) {
  require("dotenv").config();
  const { sequelize } = require("../config/db");

  (async () => {
    try {
      await sequelize.authenticate();
      console.log("Database connection established successfully.");

      await runExpirationCheckManually();

      console.log("Manual expiration check completed.");
      process.exit(0);
    } catch (error) {
      console.error("Error running manual expiration check:", error);
      process.exit(1);
    }
  })();
}
module.exports = {
  startExpirationChecks,
  checkExpiredCapsules,
  runExpirationCheckManually,
};
