const { Model, DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

class Sprint extends Model {}

Sprint.init(
  {
    sprint_id: {
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    goal: {
      type: DataTypes.TEXT,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("planned", "active", "completed"),
      defaultValue: "planned",
    },
    velocity_estimate: {
      type: DataTypes.FLOAT,
    },
  },
  {
    sequelize,
    modelName: "Sprint",
    tableName: "sprint",
    timestamps: false,
  }
);

module.exports = Sprint;
