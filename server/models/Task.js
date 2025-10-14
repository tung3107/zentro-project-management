const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const crypto = require("crypto");

function generateTaskId() {
  const array = new Uint32Array(1);
  const time = Date.now().toString().slice(-3);
  crypto.webcrypto.getRandomValues(array); // dùng webcrypto
  const random3 = (array[0] % 1000).toString().padStart(3, "0");
  return `${time}${random3}`;
}

class Task extends Model {}

Task.init(
  {
    task_id: {
      type: DataTypes.STRING(35),
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
    parent_id: {
      type: DataTypes.STRING(35),
    },

    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    type: {
      type: DataTypes.ENUM("task", "bug", "story", "feature", "subtask"),
      defaultValue: "task",
    },
    estimate: { type: DataTypes.FLOAT }, // giờ ước lượng
    spent_time: { type: DataTypes.FLOAT, defaultValue: null },
    start_date: { type: DataTypes.DATE },
    due_date: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Task",
    tableName: "task",
    timestamps: false,
    hooks: {
      beforeCreate: async (task) => {
        if (!task.task_id) {
          task.task_id = generateTaskId();
        }
      },
    },
  }
);

module.exports = Task;
