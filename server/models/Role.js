// models/User.ts
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");
const Permission = require("./Permission");

class Role extends Model {}

Role.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    is_Sytem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Role name is required" },
        len: {
          args: [1, 50],
          msg: "Role name must be at least 6 - 50 characters long",
        },
      },
    },
    description: {
      type: DataTypes.STRING(255),
      validate: {
        len: {
          args: [0, 255],
          msg: "Description must be no more than 255 characters",
        },
      },
    },
  },
  {
    sequelize, // KHÔNG PHẢI sequelize.define() nữa!
    modelName: "Role",
    tableName: "roles",
    timestamps: false,
  }
);

module.exports = Role;
