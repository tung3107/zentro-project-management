const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class TestCaseTaskRelation extends Model {}

TestCaseTaskRelation.init(
  {
    relation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    testcase_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "test_cases",
        key: "testcase_id",
      },
    },
    task_id: {
      type: DataTypes.STRING(35),
      allowNull: true,
      references: {
        model: "task",
        key: "task_id",
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
    relation_type: {
      type: DataTypes.ENUM("testcase", "suite"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "TestCaseTaskRelation",
    tableName: "testcase_task_relations",
    timestamps: false,
  }
);

module.exports = TestCaseTaskRelation;
