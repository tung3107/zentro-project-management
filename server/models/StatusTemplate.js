const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class StatusTemplate extends Model {}

StatusTemplate.init(
  {
    template_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(20),
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    background: {
      type: DataTypes.STRING(20),
    },
    border_color: {
      type: DataTypes.STRING(20),
    },
  },
  {
    sequelize,
    modelName: "StatusTemplate",
    tableName: "status_template",
    timestamps: false,
  }
);

module.exports = StatusTemplate;
