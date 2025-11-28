const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class TestCase extends Model {}

TestCase.init(
  {
    testcase_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "projects",
        key: "project_id",
      },
    },
    suite_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "test_suites",
        key: "suite_id",
      },
    },
    testcase_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
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
    created_by: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    updated_by: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: "TestCase",
    tableName: "testcase",
    timestamps: false,
  }
);

module.exports = TestCase;
