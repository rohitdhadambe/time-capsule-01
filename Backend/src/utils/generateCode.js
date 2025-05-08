const crypto = require("crypto");

/**
 * Generates a random unlock code for a time capsule
 * @param {number} length - Length of the code to generate (default: 8)
 * @returns {string} Random alphanumeric code
 */
const generateUnlockCode = (length = 8) => {
  // Create a random string of specified length with characters from the set A-Z, a-z, 0-9
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomBytes = crypto.randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % characters.length;
    result += characters.charAt(randomIndex);
  }

  return result;
};

module.exports = { generateUnlockCode };
