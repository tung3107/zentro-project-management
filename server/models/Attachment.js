const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Task = require("./Task");

class Attachment extends Model {}

Attachment.init(
  {
    attachment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "task",
        key: "task_id",
      },
    },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    file_url: { type: DataTypes.STRING(500), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    uploaded_by: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
  },
  {
    sequelize,
    modelName: "Attachment",
    tableName: "attachment",
    timestamps: false,
  }
);

module.exports = Attachment;
