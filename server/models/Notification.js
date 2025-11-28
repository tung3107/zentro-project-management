// models/Notification.js
const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Notification extends Model {}

Notification.init(
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.STRING(35),
      allowNull: false,
      comment: "ID người nhận thông báo",
    },
    type: {
      type: DataTypes.ENUM(
        "task_assigned",
        "comment_mention",
        "comment_on_task",
        "sprint_started",
        "sprint_completed",
        "testcase_assigned"
      ),
      allowNull: false,
      comment: "Loại thông báo",
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Tiêu đề thông báo",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Nội dung thông báo",
    },
    task_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID task liên quan (nếu có)",
    },
    sprint_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID sprint liên quan (nếu có)",
    },
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID comment liên quan (nếu có)",
    },
    project_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "ID project liên quan",
    },
    actor_id: {
      type: DataTypes.STRING(35),
      allowNull: true,
      comment: "ID người thực hiện hành động (người gửi thông báo)",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Đã đọc hay chưa",
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: "Link điều hướng khi click vào thông báo",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notifications",
    timestamps: false,
  }
);

module.exports = Notification;
