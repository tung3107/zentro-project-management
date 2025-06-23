// models/User.ts
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class RolePermission extends Model {}
RolePermission.init(
  {
    permission_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "permissions",
        key: "permission_id",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "roles",
        key: "role_id",
      },
    },
  },
  {
    sequelize, // KHÔNG PHẢI sequelize.define() nữa!
    modelName: "RolePermission",
    tableName: "role_permission",
    timestamps: false,
  }
);

module.exports = RolePermission;
