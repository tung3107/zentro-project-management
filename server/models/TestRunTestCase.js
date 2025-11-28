const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class TestRunTestCase extends Model {}

TestRunTestCase.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    test_run_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "test_runs",
        key: "test_run_id",
      },
      onDelete: "CASCADE",
    },
    testcase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "testcase",
        key: "testcase_id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "untested",
        "passed",
        "failed",
        "blocked",
        "skipped"
      ),
      defaultValue: "untested",
    },
    assigned_to: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    executed_by: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    executed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    is_locked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rerun_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "TestRunTestCase",
    tableName: "test_run_testcases",
    timestamps: false,
  }
);

module.exports = TestRunTestCase;
