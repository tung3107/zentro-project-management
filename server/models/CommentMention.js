const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// ======= CommentMentions (mention user) =======
class CommentMention extends Model {}

CommentMention.init(
  {
    comment_mention_id: {
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
    mentioned_user_id: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: "CommentMention",
    tableName: "comment_mentions",
    timestamps: false,
  }
);

module.exports = CommentMention;
