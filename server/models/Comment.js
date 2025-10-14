const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Task = require("./Task");
const User = require("./User");

class Comment extends Model {}

Comment.init(
  {
    comment_id: {
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
    user_id: {
      type: DataTypes.STRING(35),
      references: {
        model: "users",
        key: "user_id",
      },
    },
    content: { type: DataTypes.TEXT, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comment",
    timestamps: false,
  }
);

module.exports = Comment;
