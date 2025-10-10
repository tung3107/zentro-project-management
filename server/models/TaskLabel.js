const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class TaskLabel extends Model {}

TaskLabel.init(
  {
    label_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      references: {
        model: "label",
        key: "label_id",
      },
    },
    task_id: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "task",
        key: "task_id",
      },
    },
  },
  {
    sequelize,
    modelName: "TaskLabel",
    tableName: "task_label",
    timestamps: false,
  }
);

module.exports = TaskLabel;
