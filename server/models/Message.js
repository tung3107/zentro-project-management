const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Message extends Model {}

Message.init(
  {
    message_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chat_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "chats",
        key: "chat_id",
      },
    },
    sender_id: {
      type: DataTypes.STRING(35),
      references: {
        model: "users",
        key: "user_id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("text", "image", "file", "video", "system"),
      defaultValue: "text",
    },
    file_url: { type: DataTypes.TEXT },
    file_name: { type: DataTypes.TEXT },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    timestamps: false,
  }
);

module.exports = Message;
