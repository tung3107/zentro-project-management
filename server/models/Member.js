const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Member extends Model {}

Member.init(
  {
    project_id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      references: {
        model: "projects",
        key: "project_id",
      },
    },
    user_id: {
      type: DataTypes.STRING(35),
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "role_id",
      },
    },
    is_delete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize, // KHÔNG PHẢI sequelize.define() nữa!
    modelName: "Member",
    tableName: "members",
    timestamps: false,
  }
);

module.exports = Member;
