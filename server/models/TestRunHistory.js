const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class TestRunHistory extends Model {}

TestRunHistory.init(
  {
    history_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    test_run_testcase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "test_run_testcases",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM(
        "untested",
        "passed",
        "failed",
        "blocked",
        "skipped"
      ),
      allowNull: false,
    },
    executed_by: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    executed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "TestRunHistory",
    tableName: "test_run_history",
    timestamps: false,
  }
);

module.exports = TestRunHistory;
