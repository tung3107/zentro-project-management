// models/User.ts
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Role = require("./Role");

class Permission extends Model {}
Permission.init(
  {
    permission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    resource: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    permission_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Permission name is required" },
        len: {
          args: [1, 255],
          msg: "Permission name must be at least 6 characters long",
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
    action: {
      type: DataTypes.STRING(100),
    },
  },
  {
    sequelize, // KHÔNG PHẢI sequelize.define() nữa!
    modelName: "Permission",
    tableName: "permissions",
    timestamps: false,
  }
);

module.exports = Permission;
