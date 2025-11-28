const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class ProjectStatus extends Model {}

ProjectStatus.init(
  {
    status_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "projects",
        key: "project_id",
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(20),
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    background: {
      type: DataTypes.STRING(20),
    },
    border_color: {
      type: DataTypes.STRING(20),
    },
  },
  {
    sequelize,
    modelName: "ProjectStatus",
    tableName: "project_status",
    timestamps: false,
  }
);

module.exports = ProjectStatus;
