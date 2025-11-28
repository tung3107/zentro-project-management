const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class TestRunStep extends Model {}

TestRunStep.init(
  {
    id: {
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
    step_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("untested", "passed", "failed", "blocked", "skipped"),
      defaultValue: "untested",
    },
    actual_result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    evidence_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TestRunStep",
    tableName: "test_run_steps",
    timestamps: false,
  }
);

module.exports = TestRunStep;
