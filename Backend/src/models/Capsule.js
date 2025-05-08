const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");
const bcrypt = require("bcryptjs");

const Capsule = sequelize.define(
  "Capsule",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    unlock_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    unlock_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_expired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (capsule) => {
        if (capsule.unlock_code) {
          const salt = await bcrypt.genSalt(10);
          capsule.unlock_code = await bcrypt.hash(capsule.unlock_code, salt);
        }
      },
    },
  }
);

// Establish relationship between User and Capsule
User.hasMany(Capsule);
Capsule.belongsTo(User);

// Instance method to validate unlock code
Capsule.prototype.validUnlockCode = async function (code) {
  return await bcrypt.compare(code, this.unlock_code);
};

// Check if capsule is unlockable (current time >= unlock_at)
Capsule.prototype.isUnlockable = function () {
  return new Date() >= new Date(this.unlock_at);
};

// Check if capsule is expired (30 days after unlock_at)
Capsule.prototype.isExpired = function () {
  const expirationDate = new Date(this.unlock_at);
  expirationDate.setDate(expirationDate.getDate() + 30);
  return new Date() > expirationDate;
};

module.exports = Capsule;
