const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Label extends Model {}

Label.init(
  {
    label_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "projects",
        key: "project_id",
      },
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: true },
  },
  {
    sequelize,
    modelName: "Label",
    tableName: "label",
    timestamps: false,
  }
);

module.exports = Label;
