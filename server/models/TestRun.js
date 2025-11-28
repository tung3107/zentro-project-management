const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class TestRun extends Model {}

TestRun.init(
  {
    test_run_id: {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "completed"),
      defaultValue: "active",
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
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TestRun",
    tableName: "test_runs",
    timestamps: false,
  }
);

module.exports = TestRun;
