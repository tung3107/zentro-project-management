const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Chat extends Model {}

Chat.init(
  {
    chat_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    chat_color: {
      type: DataTypes.STRING(20),
      defaultValue: "#cb0404",
    },
    chat_avatar: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.STRING(35) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Chat",
    tableName: "chats",
    timestamps: false,
  }
);

module.exports = Chat;
