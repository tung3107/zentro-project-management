const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Task extends Model {}

Task.init(
  {
    task_id: {
      type: DataTypes.STRING(35),
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
    sprint_id: {
      type: DataTypes.INTEGER,

      references: {
        model: "sprint",
        key: "sprint_id",
      },
    },
    status_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "project_status",
        key: "status_id",
      },
    },
    assignee_id: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    reporter_id: {
      type: DataTypes.STRING(35),
      references: {
        model: "users",
        key: "user_id",
      },
    },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("TASK", "BUG", "STORY"),
      defaultValue: "TASK",
    },
    estimate: { type: DataTypes.INTEGER }, // giờ ước lượng
    progress: { type: DataTypes.INTEGER, defaultValue: 0 },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Sprint",
    tableName: "sprint",
    timestamps: false,
  }
);

module.exports = Task;
