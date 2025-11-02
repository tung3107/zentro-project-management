const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class MediaFile extends Model {}

MediaFile.init(
  {
    media_file_id: {
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
    url: {
      type: DataTypes.TEXT,
      defaultValue: false,
    },
    file_name: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM("image", "file", "video"),
    },
    uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "MediaFile",
    tableName: "media_files",
    timestamps: false,
  }
);

module.exports = MediaFile;
