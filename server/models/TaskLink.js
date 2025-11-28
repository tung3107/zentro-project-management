const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Task = require("./Task");

class TaskLink extends Model {}

TaskLink.init(
  {
    task_id: { type: DataTypes.STRING(35), primaryKey: true },
    linked_task_id: { type: DataTypes.STRING(35), primaryKey: true },
  },
  {
    sequelize,
    modelName: "TaskLink",
    tableName: "task_link",
    timestamps: false,
  }
);

module.exports = TaskLink;
