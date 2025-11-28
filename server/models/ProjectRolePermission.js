const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class ProjectRolePermission extends Model {}

ProjectRolePermission.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.STRING(50), allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    permission_id: { type: DataTypes.INTEGER, allowNull: true },
    forbidden: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    modelName: "ProjectRolePermission",
    tableName: "project_role_permission",
    timestamps: false,
  }
);

module.exports = ProjectRolePermission;
