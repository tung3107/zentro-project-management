const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class RoleTemplate extends Model {}

RoleTemplate.init(
  {
    template_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "role_id",
      },
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "permissions",
        key: "permission_id",
      },
    },
    forbidden: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "RoleTemplate",
    tableName: "role_template",
    timestamps: false,
  }
);

module.exports = RoleTemplate;
