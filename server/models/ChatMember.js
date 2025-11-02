const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class ChatMember extends Model {}

ChatMember.init(
  {
    chat_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "chats",
        key: "chat_id",
      },
    },
    user_id: {
      type: DataTypes.STRING(35),
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    blocked_by: { type: DataTypes.STRING(35) },
    blocked_at: { type: DataTypes.DATE },
    joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "ChatMember",
    tableName: "chat_members",
    timestamps: false,
  }
);

module.exports = ChatMember;
