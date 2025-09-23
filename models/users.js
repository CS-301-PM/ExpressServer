// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // make sure your sequelize instance is correct

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "ADMIN",
        "STORES_MANAGER",
        "DEPARTMENT_DEAN",
        "PROCUREMENT_OFFICER",
        "CFO"
      ),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "",
    },
    blockchain_address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

// ----- STATIC METHODS -----

// Edit user by ID
User.editById = async function (id, updates) {
  const user = await User.findByPk(id);
  if (!user) return null;

  // Only allow updating specific fields
  const allowedUpdates = [
    "role",
    "last_name",
    "first_name",
    "email",
    "username",
    "department",
    "blockchain_address",
  ];

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) user[field] = updates[field];
  });

  user.updated_at = new Date();
  await user.save();

  // Return all fields except password
  const { password_hash, ...rest } = user.get({ plain: true });
  return rest;
};

// Get all users
User.getAllUsers = async function () {
  const users = await User.findAll({
    attributes: { exclude: ["password_hash"] }, // exclude password
  });
  return users;
};

module.exports = User;
