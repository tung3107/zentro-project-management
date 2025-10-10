const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class ActivityLog extends Model {}

ActivityLog.init(
  {
    log_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: "projects",
        key: "project_id",
      },
    },
    user_id: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    entity_type: {
      type: DataTypes.ENUM("task", "project", "comment", "workflow", "sprint"),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    old_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    new_value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ActivityLog",
    tableName: "activity_log",
    timestamps: false,
  }
);

module.exports = ActivityLog;
