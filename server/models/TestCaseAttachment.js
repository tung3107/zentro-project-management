const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class TestCaseAttachment extends Model {}

TestCaseAttachment.init(
  {
    attachment_id: {
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
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    uploaded_by: {
      type: DataTypes.STRING(35),
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "TestCaseAttachment",
    tableName: "test_case_attachments",
    timestamps: false,
  }
);

module.exports = TestCaseAttachment;
