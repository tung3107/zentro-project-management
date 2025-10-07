const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class ProjectStatuses extends Model {}

ProjectStatuses.init(
  {
    status_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status_code: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    status_name_en: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status_color: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProjectStatus",
    tableName: "project_statuses",
    timestamps: false,
  }
);

module.exports = ProjectStatuses;
