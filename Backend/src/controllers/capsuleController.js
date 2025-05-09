const { validationResult } = require("express-validator");
const Capsule = require("../models/Capsule");
const { generateUnlockCode } = require("../../utils/generateCode");

/**
 * Create a new time capsule
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const createCapsule = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, unlock_at } = req.body;
    const userId = req.user.id;

    // Generate an unlock code
    const unlockCodePlain = generateUnlockCode(10);

    // Create the capsule
    const capsule = await Capsule.create({
      message,
      unlock_at,
      unlock_code: unlockCodePlain, // This will be hashed by the model hook
      userId,
    });

    // Return the capsule with the plain text unlock code (only time it's sent to client)
    res.status(201).json({
      message: "Capsule created successfully",
      capsule: {
        id: capsule.id,
        unlock_at: capsule.unlock_at,
        created_at: capsule.createdAt,
        unlock_code: unlockCodePlain, // Only sent once during creation
      },
    });
  } catch (error) {
    console.error("Create capsule error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Retrieve a time capsule if conditions are met
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getCapsule = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.query;

    if (!code) {
      return res.status(401).json({ error: "Unlock code is required" });
    }

    // Find the capsule
    const capsule = await Capsule.findByPk(id);

    if (!capsule) {
      return res.status(404).json({ error: "Capsule not found" });
    }

    // Check if capsule belongs to the authenticated user
    if (capsule.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this capsule" });
    }

    // Check if capsule is expired (more than 30 days past unlock date)
    if (capsule.is_expired || capsule.isExpired()) {
      return res
        .status(410)
        .json({ error: "This capsule has expired and is no longer available" });
    }

    // Check if it's time to unlock the capsule
    if (!capsule.isUnlockable()) {
      return res.status(403).json({
        error: "This capsule is not yet unlockable",
        unlock_at: capsule.unlock_at,
      });
    }

    // Verify unlock code
    const isValidCode = await capsule.validUnlockCode(code);
    if (!isValidCode) {
      return res.status(401).json({ error: "Invalid unlock code" });
    }

    // All checks passed, return the capsule content
    res.status(200).json({
      id: capsule.id,
      message: capsule.message,
      unlock_at: capsule.unlock_at,
      created_at: capsule.createdAt,
      updated_at: capsule.updatedAt,
    });
  } catch (error) {
    console.error("Get capsule error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * List all capsules for the authenticated user with pagination
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const listCapsules = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get capsules for the authenticated user
    const { count, rows: capsules } = await Capsule.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Prepare pagination metadata
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Map capsules to return only necessary data (omit message if locked)
    const capsuleData = capsules.map((capsule) => {
      const isUnlockable = capsule.isUnlockable();
      return {
        id: capsule.id,
        unlock_at: capsule.unlock_at,
        created_at: capsule.createdAt,
        updated_at: capsule.updatedAt,
        is_unlockable: isUnlockable,
        is_expired: capsule.is_expired || capsule.isExpired(),
        // Only include message if capsule is unlockable and not expired
        ...(isUnlockable &&
          !capsule.is_expired &&
          !capsule.isExpired() && {
            message_preview: `${capsule.message.substring(0, 30)}...`,
          }),
      };
    });

    res.status(200).json({
      capsules: capsuleData,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: totalPages,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage,
      },
    });
  } catch (error) {
    console.error("List capsules error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Update a time capsule if conditions are met
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const updateCapsule = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { code } = req.query;
    const { message, unlock_at } = req.body;

    if (!code) {
      return res.status(401).json({ error: "Unlock code is required" });
    }

    // Find the capsule
    const capsule = await Capsule.findByPk(id);

    if (!capsule) {
      return res.status(404).json({ error: "Capsule not found" });
    }

    // Check if capsule belongs to the authenticated user
    if (capsule.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this capsule" });
    }

    // Check if it's still locked (only can update before unlock time)
    if (capsule.isUnlockable()) {
      return res
        .status(403)
        .json({ error: "Capsule is already unlockable and cannot be updated" });
    }

    // Verify unlock code
    const isValidCode = await capsule.validUnlockCode(code);
    if (!isValidCode) {
      return res.status(401).json({ error: "Invalid unlock code" });
    }

    // Update the capsule
    await capsule.update({
      message: message || capsule.message,
      unlock_at: unlock_at || capsule.unlock_at,
    });

    res.status(200).json({
      message: "Capsule updated successfully",
      capsule: {
        id: capsule.id,
        unlock_at: capsule.unlock_at,
        updated_at: capsule.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update capsule error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Delete a time capsule if conditions are met
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const deleteCapsule = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.query;

    if (!code) {
      return res.status(401).json({ error: "Unlock code is required" });
    }

    // Find the capsule
    const capsule = await Capsule.findByPk(id);

    if (!capsule) {
      return res.status(404).json({ error: "Capsule not found" });
    }

    // Check if capsule belongs to the authenticated user
    if (capsule.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this capsule" });
    }

    // Check if it's still locked (only can delete before unlock time)
    if (capsule.isUnlockable()) {
      return res
        .status(403)
        .json({ error: "Capsule is already unlockable and cannot be deleted" });
    }

    // Verify unlock code
    const isValidCode = await capsule.validUnlockCode(code);
    if (!isValidCode) {
      return res.status(401).json({ error: "Invalid unlock code" });
    }

    // Delete the capsule
    await capsule.destroy();

    res.status(200).json({ message: "Capsule deleted successfully" });
  } catch (error) {
    console.error("Delete capsule error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createCapsule,
  getCapsule,
  listCapsules,
  updateCapsule,
  deleteCapsule,
};
