const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class TestCaseVersion extends Model {}

TestCaseVersion.init(
  {
    version_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    testcase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "test_cases",
        key: "testcase_id",
      },
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    pre_condition: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    steps: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    expected_result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    actual_result: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "approved", "deprecated", "active"),
      defaultValue: "draft",
    },
    updated_by: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "TestCaseVersion",
    tableName: "test_case_versions",
    timestamps: false,
  }
);

module.exports = TestCaseVersion;
