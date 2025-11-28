const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class CommentTaskMention extends Model {}

CommentTaskMention.init(
  {
    comment_task_mention_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "comment",
        key: "comment_id",
      },
      onDelete: "CASCADE",
    },
    mentioned_task_id: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "task",
        key: "task_id",
      },
      onDelete: "CASCADE",
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "CommentTaskMention",
    tableName: "comment_task_mentions",
    timestamps: false,
  }
);

module.exports = CommentTaskMention;
