// models/Stock.js

const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // adjust path to your sequelize instance

const Stock = sequelize.define(
  "Stock",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    original_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cost_each: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    prev_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    curr_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    location_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
    tableName: "stocks",
    timestamps: false, // because we manually manage created_at and updated_at
  }
);

module.exports = Stock;
