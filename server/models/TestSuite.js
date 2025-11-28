const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class TestSuite extends Model {}

TestSuite.init(
  {
    suite_id: {
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
    parent_suite_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "test_suites",
        key: "suite_id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
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
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "TestSuite",
    tableName: "test_suites",
    timestamps: false,
  }
);

module.exports = TestSuite;
