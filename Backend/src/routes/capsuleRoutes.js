const express = require("express");
const { body } = require("express-validator");
const { authenticate } = require("../middlewares/authMiddleware");
const {
  createCapsule,
  getCapsule,
  listCapsules,
  updateCapsule,
  deleteCapsule,
} = require("../controllers/capsuleController");

const router = express.Router();

// All capsule routes require authentication
router.use(authenticate);

/**
 * @route   POST /capsules
 * @desc    Create a new time capsule
 * @access  Private
 */
router.post(
  "/",
  [
    body("message").notEmpty().withMessage("Message is required"),
    body("unlock_at")
      .notEmpty()
      .withMessage("Unlock date is required")
      .isISO8601()
      .withMessage(
        "Invalid date format. Use ISO 8601 format (e.g., 2025-12-31T23:59:59Z)"
      )
      .custom((value) => {
        const unlockDate = new Date(value);
        const currentDate = new Date();

        if (unlockDate <= currentDate) {
          throw new Error("Unlock date must be in the future");
        }

        return true;
      }),
  ],
  createCapsule
);

/**
 * @route   GET /capsules/:id
 * @desc    Retrieve a specific time capsule if conditions are met
 * @access  Private
 */
router.get("/:id", getCapsule);

/**
 * @route   GET /capsules
 * @desc    List all capsules for the authenticated user with pagination
 * @access  Private
 */
router.get("/", listCapsules);

/**
 * @route   PUT /capsules/:id
 * @desc    Update a time capsule if conditions are met
 * @access  Private
 */
router.put(
  "/:id",
  [
    body("message").optional(),
    body("unlock_at")
      .optional()
      .isISO8601()
      .withMessage(
        "Invalid date format. Use ISO 8601 format (e.g., 2025-12-31T23:59:59Z)"
      )
      .custom((value) => {
        const unlockDate = new Date(value);
        const currentDate = new Date();

        if (unlockDate <= currentDate) {
          throw new Error("Unlock date must be in the future");
        }

        return true;
      }),
  ],
  updateCapsule
);

/**
 * @route   DELETE /capsules/:id
 * @desc    Delete a time capsule if conditions are met
 * @access  Private
 */
router.delete("/:id", deleteCapsule);

module.exports = router;
