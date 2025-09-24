const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // adjust path if needed

const Department = sequelize.define(
  "Department",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "departments",
    timestamps: false, // since your table has no created_at/updated_at
  }
);

module.exports = Department;
